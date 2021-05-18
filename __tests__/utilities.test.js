const { LRUCache } = require('../utilities');

describe('LRU Cache', () => {
  let cache;
  const size = 3;
  beforeEach(() => {
    cache = new LRUCache(size);
  });

  it('Can set and get value back', () => {
    cache.set('one', 'one_test');

    expect(cache.get('one')).toBe('one_test');
  });

  it('Drops the Lease Recent Used and does not exceed size limit', () => {
    cache.set('one', 'one_test');
    cache.set('two', 'two_test');
    cache.set('three', 'three_test');
    cache.set('four', 'four_test');
    cache.set('five', 'five_test');

    expect(cache.get('one')).toBe(undefined);
    expect(cache.get('two')).toBe(undefined);

    expect(cache.get('three')).toBe('three_test');
    expect(cache.get('four')).toBe('four_test');
    expect(cache.get('five')).toBe('five_test');
  });

  it('Accessing a value should move to back of line', () => {
    cache.set('one', 'one_test');
    cache.set('two', 'two_test');
    cache.set('three', 'three_test');

    cache.get('one');
    cache.set('four', 'four_test');
    cache.set('five', 'five_test');

    expect(cache.get('two')).toBe(undefined);
    expect(cache.get('three')).toBe(undefined);

    expect(cache.get('one')).toBe('one_test');
    expect(cache.get('four')).toBe('four_test');
    expect(cache.get('five')).toBe('five_test');
  });

  it('has returns true or false ', () => {
    cache.set('one', 'one_test');

    expect(cache.has('one')).toBe(true);
    expect(cache.has('two')).toBe(false);
  });
});
