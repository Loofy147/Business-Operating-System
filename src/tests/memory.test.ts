import { WorkingMemory } from '../memory/working-memory';
import { ShortTermMemory } from '../memory/short-term-memory';
import { LongTermMemory } from '../memory/long-term-memory';

describe('Memory Systems', () => {
  it('should clear WorkingMemory', () => {
    const wm = new WorkingMemory();
    wm.set('foo', 'bar');
    expect(wm.get('foo')).toBe('bar');
    wm.clear();
    expect(wm.get('foo')).toBeUndefined();
  });

  it('should promote to LongTermMemory based on access count', async () => {
    const ltm = new LongTermMemory();
    const stm = new ShortTermMemory(ltm);
    const storeSpy = jest.spyOn(ltm, 'store');

    stm.add('m1', { data: 'test' }, 1);

    // Access it multiple times to trigger promotion
    for (let i = 0; i < 5; i++) {
      stm.get('m1');
    }

    expect(storeSpy).toHaveBeenCalledWith('m1', { data: 'test' });
  });

  it('should promote to LongTermMemory based on importance', async () => {
    const ltm = new LongTermMemory();
    const stm = new ShortTermMemory(ltm);
    const storeSpy = jest.spyOn(ltm, 'store');

    stm.add('m2', { data: 'important' }, 9);
    expect(storeSpy).toHaveBeenCalledWith('m2', { data: 'important' });
  });

  it('should evict LRU items from ShortTermMemory', () => {
    const stm = new ShortTermMemory();
    // Fill up to limit (100)
    for (let i = 0; i < 100; i++) {
      stm.add(`item${i}`, { i });
    }

    // Access item0 to make it recent
    stm.get('item0');

    // Add one more to trigger eviction of item1 (the oldest now)
    stm.add('item101', { val: 101 });

    expect(stm.get('item1')).toBeNull();
    expect(stm.get('item0')).not.toBeNull();
  });
});
