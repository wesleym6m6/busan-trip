import { describe, it, expect } from 'vitest';
import data from '../data/approved-trip.json';
import { validateApprovedTripData } from './validate';
import { ApprovedTripSchema } from './schema';

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
  it('rejects missing places in backup choices and quick addresses', () => {
    const broken = structuredClone(data);
    Object.assign(broken.backupGroups[0]!.items[0]!, {mainPlaceKey: 'missing'});
    expect(validateApprovedTripData(broken).ok).toBe(false);
    const address = structuredClone(data);
    Object.assign(address.tools.address[0]!, {placeKey: 'missing'});
    expect(validateApprovedTripData(address).ok).toBe(false);
  });
  it('rejects reversed or non-positive visit budgets without requiring one for every event', () => {
    for (const visitMinutes of [{min: 0, max: 30}, {min: 90, max: 30}, {min: 1.5, max: 30}]) {
      const broken = structuredClone(data);
      Object.assign(broken.days[0]!.items[0]!, {visitMinutes});
      expect(validateApprovedTripData(broken).ok).toBe(false);
    }
  });
  it('rejects unknown illustration keys and illustrations on transit hints', () => {
    const unknown = structuredClone(data);
    Object.assign(unknown.days[0]!.items[0]!, {illustrationKey: 'missing-art'});
    expect(validateApprovedTripData(unknown).ok).toBe(false);
    const transit = structuredClone(data);
    Object.assign(transit.days[0]!.items.find(item => item.kind === 'transit')!, {illustrationKey: 'taxi'});
    expect(validateApprovedTripData(transit).ok).toBe(false);
  });
  it('keeps an event illustration attached when the event moves within the itinerary', () => {
    const moved = ApprovedTripSchema.parse(data);
    Object.assign(moved.days[0]!.items[0]!, {illustrationKey: 'flight'});
    const event = moved.days[0]!.items.shift()!;
    moved.days[0]!.items.push(event);
    const result = validateApprovedTripData(moved);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.days[0]!.items.at(-1)).toMatchObject({title: 'BX794 抵達（9 人）', illustrationKey: 'flight'});
  });
});
