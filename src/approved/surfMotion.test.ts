import { describe, expect, it } from 'vitest';
import { surfCycle, fixedCoastPoint } from './surfMotion';

describe('分層碎浪的生命週期', () => {
  it('先向岸推進、攤開，之後回退並消散，不反向重播完整浪頭', () => {
    const early = surfCycle(0.18);
    const breaking = surfCycle(0.5);
    const retreat = surfCycle(0.84);
    expect(breaking.advance).toBeGreaterThan(early.advance);
    expect(retreat.advance).toBeLessThan(breaking.advance);
    expect(retreat.spread).toBeGreaterThan(breaking.spread);
    expect(retreat.erosion).toBeGreaterThan(breaking.erosion);
    expect(retreat.opacity).toBeLessThan(breaking.opacity);
  });
  it('循環接點已完全消失，重新出生不會跳回起點', () => {
    expect(surfCycle(0).opacity).toBe(0);
    expect(surfCycle(1).opacity).toBe(0);
    expect(surfCycle(1.4)).toEqual(surfCycle(0.4));
  });
  it('保護橋、陽傘與每一組礁石，水面留給獨立泡沫層', () => {
    for (const [x, y] of [[950,350],[120,505],[260,568],[1580,629],[1738,598],[1810,596],[1810,649],[1898,648],[1970,571]]) {
      expect(fixedCoastPoint(x!,y!), `fixed at ${x},${y}`).toBe(true);
    }
    for (const [x, y] of [[700,525],[1000,585],[1250,638],[1490,602],[1720,680]]) {
      expect(fixedCoastPoint(x!,y!), `water at ${x},${y}`).toBe(false);
    }
  });
});
