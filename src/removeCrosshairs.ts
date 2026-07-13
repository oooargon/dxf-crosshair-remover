import {
  type DxfEntity,
  getLayer,
  getNumber,
  parseDxf,
  serializeDxf,
} from "./dxf.js";
import { findHoles, type Hole, type Point } from "./holes.js";

export type { Hole, Point } from "./holes.js";
export { findHoles } from "./holes.js";

export type RemoveCrosshairsOptions = {
  /** Absolute tolerance for center / length matching (drawing units). */
  tolerance?: number;
  /**
   * If true, also delete LINE entities that form a perpendicular equal-length
   * cross even when no matching hole is found (fallback).
   * Default: false — only delete lines matched to holes.
   */
  orphanCrossPairs?: boolean;
};

export type RemoveCrosshairsResult = {
  output: string;
  removedLineCount: number;
  holeCount: number;
  holes: Hole[];
  keptEntityCount: number;
};

const DEFAULT_TOLERANCE = 1e-3;

function nearlyEqual(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol;
}

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

type LineGeom = {
  entity: DxfEntity;
  start: Point;
  end: Point;
  mid: Point;
  length: number;
  dx: number;
  dy: number;
};

function lineGeometry(entity: DxfEntity): LineGeom | null {
  if (entity.type !== "LINE") return null;
  const x1 = getNumber(entity, 10);
  const y1 = getNumber(entity, 20);
  const x2 = getNumber(entity, 11);
  const y2 = getNumber(entity, 21);
  if ([x1, y1, x2, y2].some((v) => v === undefined)) return null;
  const start = { x: x1!, y: y1! };
  const end = { x: x2!, y: y2! };
  return {
    entity,
    start,
    end,
    mid: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
    length: Math.hypot(end.x - start.x, end.y - start.y),
    dx: end.x - start.x,
    dy: end.y - start.y,
  };
}

function isCrosshairForHole(line: LineGeom, hole: Hole, tol: number): boolean {
  return dist(line.mid, hole.center) <= tol && nearlyEqual(line.length, hole.diameter, tol);
}

function arePerpendicularEqualCross(a: LineGeom, b: LineGeom, tol: number): boolean {
  if (!nearlyEqual(a.length, b.length, tol)) return false;
  if (dist(a.mid, b.mid) > tol) return false;
  const dot = a.dx * b.dx + a.dy * b.dy;
  const scale = a.length * b.length;
  if (scale === 0) return false;
  return Math.abs(dot / scale) <= 1e-3;
}

/**
 * Mark LINE entities that form hole crosshairs for removal.
 */
export function selectCrosshairLines(
  entities: DxfEntity[],
  options: RemoveCrosshairsOptions = {},
): { toRemove: Set<DxfEntity>; holes: Hole[] } {
  const tol = options.tolerance ?? DEFAULT_TOLERANCE;
  const holes = findHoles(entities);
  const lines = entities.map(lineGeometry).filter((l): l is LineGeom => l !== null);

  const toRemove = new Set<DxfEntity>();

  for (const line of lines) {
    if (holes.some((hole) => isCrosshairForHole(line, hole, tol))) {
      toRemove.add(line.entity);
    }
  }

  if (options.orphanCrossPairs) {
    const remaining = lines.filter((l) => !toRemove.has(l.entity));
    const used = new Set<LineGeom>();
    for (let i = 0; i < remaining.length; i++) {
      if (used.has(remaining[i])) continue;
      for (let j = i + 1; j < remaining.length; j++) {
        if (used.has(remaining[j])) continue;
        if (arePerpendicularEqualCross(remaining[i], remaining[j], tol)) {
          toRemove.add(remaining[i].entity);
          toRemove.add(remaining[j].entity);
          used.add(remaining[i]);
          used.add(remaining[j]);
          break;
        }
      }
    }
  }

  return { toRemove, holes };
}

export function removeCrosshairsFromDxf(
  text: string,
  options: RemoveCrosshairsOptions = {},
): RemoveCrosshairsResult {
  const parsed = parseDxf(text);
  const { toRemove, holes } = selectCrosshairLines(parsed.entities, options);
  const kept = parsed.entities.filter((entity) => !toRemove.has(entity));

  return {
    output: serializeDxf(parsed, kept),
    removedLineCount: toRemove.size,
    holeCount: holes.length,
    holes,
    keptEntityCount: kept.length,
  };
}

export function summarizeDxf(text: string): {
  entityCounts: Record<string, number>;
  layerCounts: Record<string, Record<string, number>>;
  holes: Hole[];
  crosshairLines: number;
} {
  const parsed = parseDxf(text);
  const entityCounts: Record<string, number> = {};
  const layerCounts: Record<string, Record<string, number>> = {};

  for (const entity of parsed.entities) {
    entityCounts[entity.type] = (entityCounts[entity.type] ?? 0) + 1;
    if (entity.type === "VERTEX" || entity.type === "SEQEND") continue;
    const layer = getLayer(entity);
    layerCounts[layer] ??= {};
    layerCounts[layer][entity.type] = (layerCounts[layer][entity.type] ?? 0) + 1;
  }

  const { toRemove, holes } = selectCrosshairLines(parsed.entities);
  return {
    entityCounts,
    layerCounts,
    holes,
    crosshairLines: toRemove.size,
  };
}

export { getLayer, parseDxf, serializeDxf };
