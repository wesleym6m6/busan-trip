/** Original illustration coordinates. Foreground silhouettes never participate in motion. */
export const COAST_SIZE = [1983, 793] as const;
type Point = readonly [number, number];
export const WATER_OUTLINE: readonly Point[] = [
  [0,440],[1983,440],[1983,793],[1230,793],[1135,771],[990,752],[860,730],
  [748,712],[655,693],[610,682],[633,666],[593,649],[502,635],[412,621],
  [320,614],[239,603],[159,586],[65,575],[0,569],
];
// Foam may briefly run a few painted pixels onto the sand; the sand itself stays fixed.
export const SURF_OUTLINE: readonly Point[] = WATER_OUTLINE.map(([x,y], i) => [x, i > 2 ? Math.min(793, y + 14) : y]);
export const FIXED_FOREGROUND: readonly (readonly Point[])[] = [
  // Yellow parasol, including its pole.
  [[0,535],[9,514],[37,490],[75,463],[113,446],[132,451],[172,462],[213,481],
    [242,497],[232,516],[184,537],[141,547],[140,616],[147,653],[135,654],
    [118,549],[54,551],[24,549]],
  // Coral parasol, including its pole.
  [[152,575],[180,546],[222,528],[261,513],[301,524],[345,548],[374,572],
    [353,588],[274,599],[261,675],[248,683],[243,677],[248,596],[208,595],[168,584]],
  // Three individually traced groups of rocks (no ellipse around the entire coast).
  [[1508,641],[1525,627],[1539,615],[1553,611],[1568,605],[1576,609],
    [1595,610],[1605,619],[1618,629],[1621,642],[1591,648],[1550,647]],
  [[1625,632],[1647,615],[1663,612],[1675,619],[1686,605],[1702,583],
    [1721,572],[1736,557],[1752,555],[1774,565],[1786,563],[1807,558],
    [1829,573],[1842,590],[1850,577],[1863,567],[1874,546],[1893,533],
    [1913,531],[1936,538],[1951,534],[1963,516],[1983,506],[1983,640],
    [1960,633],[1945,638],[1925,627],[1914,621],[1892,638],[1879,637],
    [1865,630],[1847,640],[1835,633],[1820,629],[1804,629],[1785,626],
    [1771,636],[1750,640],[1736,634],[1720,636],[1705,635],[1690,637],
    [1675,632],[1660,637]],
  [[1701,668],[1715,650],[1731,650],[1743,640],[1755,630],[1770,629],
    [1784,619],[1794,622],[1810,624],[1826,634],[1840,640],[1848,639],
    [1860,629],[1879,627],[1898,634],[1906,642],[1919,645],[1939,654],
    [1938,664],[1911,666],[1889,663],[1876,668],[1855,674],[1833,670],
    [1810,674],[1788,674],[1763,672],[1748,677],[1734,671]],
];

function contains(polygon: readonly Point[], x: number, y: number) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!; const b = polygon[j]!;
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
export function fixedCoastPoint(x: number, y: number) {
  return !contains(SURF_OUTLINE, x, y) || FIXED_FOREGROUND.some(polygon => contains(polygon, x, y));
}

const smooth = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};
/** A wave is born, runs up, spreads, then drains away. The reset happens at zero opacity. */
export function surfCycle(cycle: number) {
  const phase = ((cycle % 1) + 1) % 1;
  return {
    advance: smooth(0, 0.50, phase) - 0.26 * smooth(0.54, 1, phase),
    spread: smooth(0.15, 0.85, phase),
    opacity: smooth(0, 0.16, phase) * (1 - smooth(0.58, 1, phase)),
    erosion: smooth(0.40, 1, phase),
  };
}
