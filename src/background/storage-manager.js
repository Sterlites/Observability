/**
 * Storage Manager
 * Handles persistence, indexing, and querying of network data
 */

class StorageManager {
  constructor() {
    this.storageKey = 'network_requests';
    this.indexKey = 'request_index';
    this.statsKey = 'network_stats';
    this.maxRequests = 10000; // Maximum requests to store
    this.batchSize = 100; // Batch operations for performance
    this.isInitialized = false;
  }

  /**
   * Initialize storage
   */
  async initialize() {
    if (this.isInitialized) return;

    console.log('[StorageManager] Initializing...');
    
    // Initialize stats if not present
    const stats = await this.getFromStorage(this.statsKey);
    if (!stats) {
      await this.saveToStorage(this.statsKey, {
        totalRequests: 0,
        totalErrors: 0,
        totalDataTransferred: 0,
        firstRequestTime: Date.now(),
        lastRequestTime: Date.now()
      });
    }

    this.isInitialized = true;
    console.log('[StorageManager] Initialized successfully');
  }

  /**
   * Store a network request
   */
  async storeRequest(requestData) {
    try {
      // Get current requests
      const requests = await this.getFromStorage(this.storageKey) || [];
      
      // Add new request
      requests.push(requestData);

      // Enforce size limit (keep most recent)
      if (requests.length > this.maxRequests) {
        requests.splice(0, requests.length - this.maxRequests);
      }

      // Save back to storage
      await this.saveToStorage(this.storageKey, requests);

      // Update index
      await this.updateIndex(requestData);

      // Update stats
      await this.updateStats(requestData);

    } catch (error) {
      console.error('[StorageManager] Error storing request:', error);
    }
  }

  /**
   * Update search index for efficient querying
   */
  async updateIndex(requestData) {
    try {
      const index = await this.getFromStorage(this.indexKey) || {
        byDomain: {},
        byMethod: {},
        byStatus: {},
        byType: {},
        byDate: {}
      };

      // Index by domain
      const domain = this.extractDomain(requestData.url);
      if (!index.byDomain[domain]) index.byDomain[domain] = [];
      index.byDomain[domain].push(requestData.id);

      // Index by method
      if (!index.byMethod[requestData.method]) index.byMethod[requestData.method] = [];
      index.byMethod[requestData.method].push(requestData.id);

      // Index by status
      const status = requestData.statusCode || 'error';
      if (!index.byStatus[status]) index.byStatus[status] = [];
      index.byStatus[status].push(requestData.id);

      // Index by type
      if (!index.byType[requestData.type]) index.byType[requestData.type] = [];
      index.byType[requestData.type].push(requestData.id);

      // Index by date (day)
      const dateKey = new Date(requestData.startTime).toISOString().split('T')[0];
      if (!index.byDate[dateKey]) index.byDate[dateKey] = [];
      index.byDate[dateKey].push(requestData.id);

      await this.saveToStorage(this.indexKey, index);
    } catch (error) {
      console.error('[StorageManager] Error updating index:', error);
    }
  }

  /**
   * Update statistics
   */
  async updateStats(requestData) {
    try {
      const stats = await this.getFromStorage(this.statsKey);
      
      stats.totalRequests++;
      if (requestData.error || requestData.statusCode >= 400) {
        stats.totalErrors++;
      }
      stats.lastRequestTime = Date.now();

      await this.saveToStorage(this.statsKey, stats);
    } catch (error) {
      console.error('[StorageManager] Error updating stats:', error);
    }
  }

  /**
   * Get requests with filters
   */
  async getRequests(filters = {}) {
    try {
      const requests = await this.getFromStorage(this.storageKey) || [];
      
      return this.filterRequests(requests, filters);
    } catch (error) {
      console.error('[StorageManager] Error getting requests:', error);
      return [];
    }
  }

  /**
   * Filter requests based on criteria
   */
  filterRequests(requests, filters) {
    let filtered = [...requests];

    // Filter by URL pattern
    if (filters.urlPattern) {
      const pattern = filters.urlPattern.toLowerCase();
      filtered = filtered.filter(r => r.url.toLowerCase().includes(pattern));
    }

    // Filter by method
    if (filters.method && filters.method !== 'all') {
      filtered = filtered.filter(r => r.method === filters.method);
    }

    // Filter by status code
    if (filters.statusCode) {
      filtered = filtered.filter(r => r.statusCode === parseInt(filters.statusCode));
    }

    // Filter by resource type
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(r => r.type === filters.type);
    }

    // Filter by time range
    if (filters.startTime) {
      filtered = filtered.filter(r => r.startTime >= filters.startTime);
    }
    if (filters.endTime) {
      filtered = filtered.filter(r => r.startTime <= filters.endTime);
    }

    // Filter by tab
    if (filters.tabId !== undefined && filters.tabId !== null) {
      filtered = filtered.filter(r => r.tabId === filters.tabId);
    }

    // Filter by domain
    if (filters.domain) {
      filtered = filtered.filter(r => this.extractDomain(r.url) === filters.domain);
    }

    // Sort by timestamp (most recent first)
    filtered.sort((a, b) => b.startTime - a.startTime);

    // Limit results
    const limit = filters.limit || 1000;
    return filtered.slice(0, limit);
  }

  /**
   * Get analytics data
   */
  async getAnalytics(timeRange = '1h') {
    try {
      const requests = await this.getFromStorage(this.storageKey) || [];
      const now = Date.now();
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };

      const cutoff = now - (timeRanges[timeRange] || timeRanges['1h']);
      const filtered = requests.filter(r => r.startTime >= cutoff);

      return {
        totalRequests: filtered.length,
        byMethod: this.groupBy(filtered, 'method'),
        byStatus: this.groupByStatus(filtered),
        byDomain: this.groupByDomain(filtered),
        byType: this.groupBy(filtered, 'type'),
        timeline: this.generateTimeline(filtered, timeRange),
        avgDuration: this.calculateAvgDuration(filtered),
        errorRate: this.calculateErrorRate(filtered),
        topDomains: this.getTopDomains(filtered, 10),
        slowestRequests: this.getSlowestRequests(filtered, 10)
      };
    } catch (error) {
      console.error('[StorageManager] Error getting analytics:', error);
      return null;
    }
  }

  /**
   * Get current statistics
   */
  async getStats() {
    return await this.getFromStorage(this.statsKey);
  }

  /**
   * Update tab information
   */
  async updateTabInfo(tabInfo) {
    // Could store tab session data here for correlation
    // For now, we're enriching requests in real-time
  }

  /**
   * Clear all data
   */
  async clearAll() {
    await chrome.storage.local.clear();
    await this.initialize();
  }

  /**
   * Export data
   */
  async exportData(filters = {}) {
    const requests = await this.getRequests(filters);
    const stats = await this.getStats();
    
    return {
      exportTime: new Date().toISOString(),
      stats: stats,
      requests: requests
    };
  }

  // Helper methods

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }

  groupBy(items, key) {
    return items.reduce((acc, item) => {
      const value = item[key] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  groupByStatus(items) {
    return items.reduce((acc, item) => {
      const status = item.statusCode || 'error';
      const category = this.getStatusCategory(status);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }

  getStatusCategory(status) {
    if (typeof status !== 'number') return 'Error';
    if (status < 200) return '1xx';
    if (status < 300) return '2xx';
    if (status < 400) return '3xx';
    if (status < 500) return '4xx';
    return '5xx';
  }

  groupByDomain(items) {
    return items.reduce((acc, item) => {
      const domain = this.extractDomain(item.url);
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});
  }

  generateTimeline(items, timeRange) {
    const buckets = timeRange === '1h' ? 12 : 24; // 5-min or 1-hour buckets
    const bucketSize = timeRange === '1h' ? 5 * 60 * 1000 : 60 * 60 * 1000;
    
    const timeline = new Array(buckets).fill(0);
    const now = Date.now();

    items.forEach(item => {
      const age = now - item.startTime;
      const bucketIndex = Math.floor(age / bucketSize);
      if (bucketIndex >= 0 && bucketIndex < buckets) {
        timeline[buckets - 1 - bucketIndex]++;
      }
    });

    return timeline.map((count, index) => ({
      time: now - (buckets - index) * bucketSize,
      count: count
    }));
  }

  calculateAvgDuration(items) {
    if (items.length === 0) return 0;
    const total = items.reduce((sum, item) => sum + (item.duration || 0), 0);
    return Math.round(total / items.length);
  }

  calculateErrorRate(items) {
    if (items.length === 0) return 0;
    const errors = items.filter(r => r.error || (r.statusCode && r.statusCode >= 400)).length;
    return ((errors / items.length) * 100).toFixed(2);
  }

  getTopDomains(items, limit) {
    const domainCounts = this.groupByDomain(items);
    return Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([domain, count]) => ({ domain, count }));
  }

  getSlowestRequests(items, limit) {
    return items
      .filter(r => r.duration)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map(r => ({
        url: r.url,
        duration: r.duration,
        method: r.method,
        statusCode: r.statusCode
      }));
  }

  async getFromStorage(key) {
    const result = await chrome.storage.local.get(key);
    return result[key];
  }

  async saveToStorage(key, value) {
    await chrome.storage.local.set({ [key]: value });
  }
}

export default StorageManager;