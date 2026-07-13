/** Minimal ASCII DXF group-code parser (preserves original line endings / formatting). */

export type DxfPair = {
  code: string;
  value: string;
  /** Original raw lines for this pair, including trailing newline style preserved via join. */
  rawCodeLine: string;
  rawValueLine: string;
};

export type DxfEntity = {
  type: string;
  pairs: DxfPair[];
};

export type ParsedDxf = {
  /** Everything before ENTITIES content (including `0\\nSECTION\\n2\\nENTITIES\\n`). */
  preamble: string;
  entities: DxfEntity[];
  /** From `0\\nENDSEC` of ENTITIES through EOF. */
  epilogue: string;
  newline: string;
};

function detectNewline(text: string): string {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

/**
 * Split ASCII DXF into group-code pairs, keeping original code/value line text.
 */
export function parsePairs(text: string): DxfPair[] {
  const newline = detectNewline(text);
  const lines = text.split(/\r?\n/);
  // Drop possible trailing empty line from final newline
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  const pairs: DxfPair[] = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    pairs.push({
      code: lines[i].trim(),
      value: lines[i + 1],
      rawCodeLine: lines[i],
      rawValueLine: lines[i + 1],
    });
  }

  if (lines.length % 2 !== 0) {
    // Odd trailing line — keep as a synthetic pair so we don't lose data
    pairs.push({
      code: lines[lines.length - 1].trim(),
      value: "",
      rawCodeLine: lines[lines.length - 1],
      rawValueLine: "",
    });
  }

  void newline;
  return pairs;
}

function pairText(pair: DxfPair, newline: string): string {
  if (pair.rawValueLine === "" && pair.value === "") {
    return pair.rawCodeLine + newline;
  }
  return pair.rawCodeLine + newline + pair.rawValueLine + newline;
}

/**
 * Parse DXF focusing on the ENTITIES section. Other sections are kept verbatim.
 */
export function parseDxf(text: string): ParsedDxf {
  const newline = detectNewline(text);
  const pairs = parsePairs(text);

  let entitiesStart = -1; // index of pair after `2 / ENTITIES`
  let entitiesEnd = -1; // index of `0 / ENDSEC` that closes ENTITIES

  for (let i = 0; i < pairs.length; i++) {
    if (
      pairs[i].code === "0" &&
      pairs[i].value.trim() === "SECTION" &&
      i + 1 < pairs.length &&
      pairs[i + 1].code === "2" &&
      pairs[i + 1].value.trim() === "ENTITIES"
    ) {
      entitiesStart = i + 2;
      continue;
    }
    if (entitiesStart >= 0 && entitiesEnd < 0 && pairs[i].code === "0" && pairs[i].value.trim() === "ENDSEC") {
      entitiesEnd = i;
      break;
    }
  }

  if (entitiesStart < 0 || entitiesEnd < 0) {
    throw new Error("ENTITIES section not found in DXF");
  }

  const preamblePairs = pairs.slice(0, entitiesStart);
  const entityPairs = pairs.slice(entitiesStart, entitiesEnd);
  const epiloguePairs = pairs.slice(entitiesEnd);

  const entities: DxfEntity[] = [];
  let current: DxfEntity | null = null;

  for (const pair of entityPairs) {
    if (pair.code === "0") {
      if (current) entities.push(current);
      current = { type: pair.value.trim(), pairs: [pair] };
    } else if (current) {
      current.pairs.push(pair);
    }
  }
  if (current) entities.push(current);

  return {
    preamble: preamblePairs.map((p) => pairText(p, newline)).join(""),
    entities,
    epilogue: epiloguePairs.map((p) => pairText(p, newline)).join(""),
    newline,
  };
}

export function serializeDxf(parsed: ParsedDxf, entities: DxfEntity[]): string {
  const { newline } = parsed;
  const body = entities
    .map((entity) => entity.pairs.map((p) => pairText(p, newline)).join(""))
    .join("");
  return parsed.preamble + body + parsed.epilogue;
}

export function getCodes(entity: DxfEntity, code: number): string[] {
  return entity.pairs.filter((p) => p.code === String(code)).map((p) => p.value.trim());
}

export function getNumber(entity: DxfEntity, code: number, index = 0): number | undefined {
  const values = getCodes(entity, code);
  if (index >= values.length) return undefined;
  const n = Number(values[index]);
  return Number.isFinite(n) ? n : undefined;
}

export function getLayer(entity: DxfEntity): string {
  return getCodes(entity, 8)[0] ?? "0";
}
