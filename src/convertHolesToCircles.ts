import { type DxfEntity, parseDxf, serializeDxf } from "./dxf.js";
import {
  createCircleEntity,
  findHoles,
  flattenGroup,
  groupEntities,
  holeFromBulgePolyline,
  isPolylineGroup,
  type Hole,
} from "./holes.js";

export type ConvertHolesToCirclesResult = {
  output: string;
  convertedCount: number;
  holes: Hole[];
  keptEntityCount: number;
};

/**
 * Replace circular bulge-polylines (Tekla hole openings) with real CIRCLE entities.
 * Contour polylines, text, lines, and existing circles are left untouched.
 */
export function convertHolesToCirclesFromDxf(text: string): ConvertHolesToCirclesResult {
  const parsed = parseDxf(text);
  const groups = groupEntities(parsed.entities);
  const convertedHoles: Hole[] = [];
  const outEntities: DxfEntity[] = [];

  for (const group of groups) {
    if (isPolylineGroup(group)) {
      const hole = holeFromBulgePolyline(group);
      if (hole) {
        outEntities.push(createCircleEntity(hole, group.polyline));
        convertedHoles.push(hole);
        continue;
      }
      outEntities.push(...flattenGroup(group));
      continue;
    }
    outEntities.push(group);
  }

  return {
    output: serializeDxf(parsed, outEntities),
    convertedCount: convertedHoles.length,
    holes: convertedHoles,
    keptEntityCount: outEntities.length,
  };
}

export { findHoles };
