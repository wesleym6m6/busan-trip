import { describe, it, expect } from 'vitest';
import data from '../data/approved-trip.json';
import { validateApprovedTripData } from './validate';

describe('approved trip data contract', () => {
  it('accepts the supplied five-day trip', () => {
    const result = validateApprovedTripData(data);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.days).toHaveLength(5);
  });
  it('rejects dangling map references and duplicate packing storage IDs', () => {
    const broken = structuredClone(data);
    Object.assign(broken.days[0]!.items[0]!, {placeKey: 'missing'});
    broken.packing[1]!.items[0]!.id = broken.packing[0]!.items[0]!.id;
    const result = validateApprovedTripData(broken);
    expect(result.ok).toBe(false);
    expect(result.issues.join(' ')).toContain('Unknown place');
    expect(result.issues.join(' ')).toContain('Duplicate packing id');
  });
  it('rejects empty days and unsafe map links', () => {
    expect(validateApprovedTripData({...data, days: []}).ok).toBe(false);
    expect(validateApprovedTripData({...data, lodging: {...data.lodging, mapUrl:'javascript:alert(1)'}}).ok).toBe(false);
  });
});
