export class OptimizationService {
  constructor() {
    this.cache = new Map();
    this.requestQueue = new Map();
    this.batchSize = 5;
    this.batchDelay = 100;
  }

  async batchRequest(key, requestFn) {
    if (!this.requestQueue.has(key)) {
      this.requestQueue.set(key, []);

      setTimeout(async () => {
        const batch = this.requestQueue.get(key);
        this.requestQueue.delete(key);

        try {
          const result = await requestFn(batch);
          batch.forEach(({ resolve }) => resolve(result));
        } catch (error) {
          batch.forEach(({ reject }) => reject(error));
        }
      }, this.batchDelay);
    }

    return new Promise((resolve, reject) => {
      this.requestQueue.get(key).push({ resolve, reject });
    });
  }

  async smartCache(key, getData, options = { ttl: 300000 }) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < options.ttl) {
      return cached.data;
    }

    const data = await getData();
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  preloadData(keys, getData) {
    return Promise.all(
      keys.map((key) => this.smartCache(key, () => getData(key)))
    );
  }
}
