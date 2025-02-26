class CacheService {
  constructor() {
    this.loadCache();
  }

  loadCache() {
    try {
      const data = localStorage.getItem('trade-ai-cache');
      this.cache = data ? JSON.parse(data) : {};
      this.cleanExpired();
    } catch (err) {
      console.log('Error loading cache:', err);
      this.cache = {};
    }
  }

  saveCache() {
    try {
      localStorage.setItem('trade-ai-cache', JSON.stringify(this.cache));
    } catch (err) {
      console.error('Error saving cache:', err);
    }
  }

  get(key) {
    const item = this.cache[key];
    if (!item) return null;

    if (Date.now() > item.expiry) {
      delete this.cache[key];
      this.saveCache();
      return null;
    }
    return item.data;
  }

  set(key, data, ttlMinutes = 120) {
    this.cache[key] = {
      data,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    };
    this.saveCache();
  }

  cleanExpired() {
    const now = Date.now();
    Object.keys(this.cache).forEach((key) => {
      if (now > this.cache[key].expiry) {
        delete this.cache[key];
      }
    });
    this.saveCache();
  }
}

export const cacheService = new CacheService();
