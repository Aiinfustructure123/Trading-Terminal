/** Squarified treemap layout (Bruls et al.) in normalized 0–100 space. */

export interface TreemapInput {
  id: string;
  value: number;
}

export interface TreemapRect<T extends TreemapInput = TreemapInput> {
  item: T;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function squarify<T extends TreemapInput>(
  input: T[],
  width = 100,
  height = 100,
): TreemapRect<T>[] {
  const items = [...input].filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  if (items.length === 0) return [];
  const total = items.reduce((s, i) => s + i.value, 0);
  const scale = (width * height) / total;
  const areas = items.map((i) => i.value * scale);

  const out: TreemapRect<T>[] = [];
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;
  let row: number[] = [];
  let rowStart = 0;

  const worst = (rowAreas: number[], side: number): number => {
    const sum = rowAreas.reduce((a, b) => a + b, 0);
    const max = Math.max(...rowAreas);
    const min = Math.min(...rowAreas);
    const s2 = sum * sum;
    const l2 = side * side;
    return Math.max((l2 * max) / s2, s2 / (l2 * min));
  };

  const layoutRow = (rowAreas: number[], startIdx: number): void => {
    const sum = rowAreas.reduce((a, b) => a + b, 0);
    const horizontal = w >= h; // lay the row along the shorter side
    const side = horizontal ? h : w;
    const thickness = sum / side;
    let offset = 0;
    rowAreas.forEach((area, i) => {
      const len = area / thickness;
      const item = items[startIdx + i];
      if (horizontal) {
        out.push({ item, x, y: y + offset, w: thickness, h: len });
      } else {
        out.push({ item, x: x + offset, y, w: len, h: thickness });
      }
      offset += len;
    });
    if (horizontal) {
      x += thickness;
      w -= thickness;
    } else {
      y += thickness;
      h -= thickness;
    }
  };

  for (let i = 0; i < areas.length; i++) {
    const side = Math.min(w, h);
    if (row.length === 0 || worst([...row, areas[i]], side) <= worst(row, side)) {
      row.push(areas[i]);
    } else {
      layoutRow(row, rowStart);
      rowStart = i;
      row = [areas[i]];
    }
  }
  if (row.length > 0) layoutRow(row, rowStart);
  return out;
}
