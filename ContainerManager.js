/*
 |------------------------------------------------------------------------------
 | Statuo - ContainerManager
 |------------------------------------------------------------------------------
 |
 | This piece of code solves problems with resolving the correct container at
 | the right time.
 |
 | Since there can be different types of containers and it can be hard to
 | determine what container should be used at what time.
 |
 | The manager ensures that we have our containers managed in one place,
 | and allows for a bridge between our components and our container instances.
 |
 */

const memoize = fn => {
  const cache = new Map();
  const cached = function(val) {
    return cache.has(val) ? cache.get(val) : cache.set(val, fn.call(this, val)) && cache.get(val);
  };
  cached.cache = cache;
  return cached;
};

/* ========================================================================== */

class ContainerManager {
  constructor(containerMapping = {}, getKey) {
    this.containerMapping = containerMapping;
    this.getKey = getKey;
  }

  getInstance = memoize(
    key => new this.containerMapping[key]()
  );

  get(getKey = this.getKey) {
    if(typeof getKey !== 'string' || typeof getKey !== 'function') {
      throw new TypeError('getContainer did not get a valid `getter` specified. Expected string or function.');
    }

    return getInstance(typeof getKey === 'string' ? getKey : getKey());
  }
}
