export class OptimizationService {
  constructor() {
    this.cache = new Map();
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
}
