import { type DxfEntity, type DxfPair, getLayer, getNumber } from "./dxf.js";

export type Point = { x: number; y: number };

export type Hole = {
  center: Point;
  diameter: number;
  layer: string;
  source: "polyline-bulge" | "circle";
};

export type PolylineGroup = {
  polyline: DxfEntity;
  vertices: DxfEntity[];
  seqend?: DxfEntity;
};

export type EntityGroup = DxfEntity | PolylineGroup;

/**
 * Group POLYLINE + VERTEX... + SEQEND into compound entities for analysis.
 */
export function groupEntities(entities: DxfEntity[]): EntityGroup[] {
  const groups: EntityGroup[] = [];
  let i = 0;
  while (i < entities.length) {
    const entity = entities[i];
    if (entity.type === "POLYLINE") {
      const vertices: DxfEntity[] = [];
      i += 1;
      while (i < entities.length && entities[i].type === "VERTEX") {
        vertices.push(entities[i]);
        i += 1;
      }
      let seqend: DxfEntity | undefined;
      if (i < entities.length && entities[i].type === "SEQEND") {
        seqend = entities[i];
        i += 1;
      }
      groups.push({ polyline: entity, vertices, seqend });
      continue;
    }
    groups.push(entity);
    i += 1;
  }
  return groups;
}

export function isPolylineGroup(group: EntityGroup): group is PolylineGroup {
  return "polyline" in group;
}

export function flattenGroup(group: EntityGroup): DxfEntity[] {
  if (isPolylineGroup(group)) {
    const out: DxfEntity[] = [group.polyline, ...group.vertices];
    if (group.seqend) out.push(group.seqend);
    return out;
  }
  return [group];
}

/**
 * Circular hole as closed 2-vertex polyline with bulge ±1 (Tekla NC DXF style).
 * Diameter = distance between the two vertices (they form a diameter).
 */
export function holeFromBulgePolyline(group: PolylineGroup): Hole | null {
  const flags = getNumber(group.polyline, 70) ?? 0;
  const closed = (flags & 1) === 1;
  if (!closed || group.vertices.length !== 2) return null;

  const v0 = {
    x: getNumber(group.vertices[0], 10) ?? NaN,
    y: getNumber(group.vertices[0], 20) ?? NaN,
    bulge: getNumber(group.vertices[0], 42) ?? 0,
  };
  const v1 = {
    x: getNumber(group.vertices[1], 10) ?? NaN,
    y: getNumber(group.vertices[1], 20) ?? NaN,
    bulge: getNumber(group.vertices[1], 42) ?? 0,
  };

  if (![v0.x, v0.y, v1.x, v1.y].every(Number.isFinite)) return null;
  if (Math.abs(Math.abs(v0.bulge) - 1) > 1e-6) return null;
  if (Math.abs(Math.abs(v1.bulge) - 1) > 1e-6) return null;

  return {
    center: { x: (v0.x + v1.x) / 2, y: (v0.y + v1.y) / 2 },
    diameter: Math.hypot(v1.x - v0.x, v1.y - v0.y),
    layer: getLayer(group.polyline),
    source: "polyline-bulge",
  };
}

export function holeFromCircle(entity: DxfEntity): Hole | null {
  if (entity.type !== "CIRCLE") return null;
  const x = getNumber(entity, 10);
  const y = getNumber(entity, 20);
  const r = getNumber(entity, 40);
  if (x === undefined || y === undefined || r === undefined) return null;
  return {
    center: { x, y },
    diameter: r * 2,
    layer: getLayer(entity),
    source: "circle",
  };
}

export function findHoles(entities: DxfEntity[]): Hole[] {
  const holes: Hole[] = [];
  for (const group of groupEntities(entities)) {
    if (isPolylineGroup(group)) {
      const hole = holeFromBulgePolyline(group);
      if (hole) holes.push(hole);
    } else {
      const hole = holeFromCircle(group);
      if (hole) holes.push(hole);
    }
  }
  return holes;
}

function makePair(code: number | string, value: string): DxfPair {
  return {
    code: String(code),
    value,
    rawCodeLine: String(code),
    rawValueLine: value,
  };
}

function formatCoord(n: number): string {
  return n.toFixed(3);
}

function optionalCode(entity: DxfEntity, code: number): string | undefined {
  const values = entity.pairs.filter((p) => p.code === String(code)).map((p) => p.value.trim());
  return values[0];
}

/** Build a CIRCLE entity matching Tekla-style DXF formatting. */
export function createCircleEntity(hole: Hole, template?: DxfEntity): DxfEntity {
  const layer = hole.layer || (template ? getLayer(template) : "0");
  const linetype = template ? optionalCode(template, 6) : undefined;
  const color = template ? optionalCode(template, 62) : undefined;
  const z = template ? optionalCode(template, 30) : "0.000";

  const pairs: DxfPair[] = [
    makePair(0, "CIRCLE"),
    makePair(8, layer),
  ];
  if (linetype) pairs.push(makePair(6, linetype));
  if (color) pairs.push(makePair(62, color));
  pairs.push(
    makePair(10, formatCoord(hole.center.x)),
    makePair(20, formatCoord(hole.center.y)),
    makePair(30, z ?? "0.000"),
    makePair(40, formatCoord(hole.diameter / 2)),
  );

  return { type: "CIRCLE", pairs };
}
