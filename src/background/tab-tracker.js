/**
 * Tab Tracker
 * Monitors tab activity and correlates with network requests
 */

class TabTracker {
  constructor() {
    this.tabs = new Map();
    this.listeners = new Map();
    this.isActive = false;
  }

  /**
   * Start tracking tabs
   */
  start() {
    if (this.isActive) return;

    console.log('[TabTracker] Starting tab tracking...');

    // Track tab updates
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));

    // Track tab activation
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));

    // Track tab removal
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));

    // Track tab creation
    chrome.tabs.onCreated.addListener(this.handleTabCreated.bind(this));

    // Initialize with current tabs
    this.initializeTabs();

    this.isActive = true;
    console.log('[TabTracker] Tab tracking started');
  }

  /**
   * Stop tracking tabs
   */
  stop() {
    if (!this.isActive) return;

    chrome.tabs.onUpdated.removeListener(this.handleTabUpdated);
    chrome.tabs.onActivated.removeListener(this.handleTabActivated);
    chrome.tabs.onRemoved.removeListener(this.handleTabRemoved);
    chrome.tabs.onCreated.removeListener(this.handleTabCreated);

    this.isActive = false;
    console.log('[TabTracker] Tab tracking stopped');
  }

  /**
   * Initialize with current tabs
   */
  async initializeTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        this.updateTabInfo(tab);
      });
    } catch (error) {
      console.error('[TabTracker] Error initializing tabs:', error);
    }
  }

  /**
   * Handle tab updates
   */
  handleTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.url) {
      this.updateTabInfo(tab);
      this.emit('tabUpdate', this.getTabData(tab));
    }
  }

  /**
   * Handle tab activation
   */
  handleTabActivated(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (chrome.runtime.lastError) return;
      this.updateTabInfo(tab);
      this.emit('tabActivated', this.getTabData(tab));
    });
  }

  /**
   * Handle tab removal
   */
  handleTabRemoved(tabId, removeInfo) {
    this.tabs.delete(tabId);
    this.emit('tabRemoved', { tabId, removeInfo });
  }

  /**
   * Handle tab creation
   */
  handleTabCreated(tab) {
    this.updateTabInfo(tab);
    this.emit('tabCreated', this.getTabData(tab));
  }

  /**
   * Update tab information in cache
   */
  updateTabInfo(tab) {
    const tabData = this.getTabData(tab);
    this.tabs.set(tab.id, tabData);
  }

  /**
   * Get tab information
   */
  async getTabInfo(tabId) {
    // Return cached info if available
    if (this.tabs.has(tabId)) {
      return this.tabs.get(tabId);
    }

    // Otherwise fetch from Chrome API
    try {
      const tab = await chrome.tabs.get(tabId);
      const tabData = this.getTabData(tab);
      this.tabs.set(tabId, tabData);
      return tabData;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract relevant tab data
   */
  getTabData(tab) {
    return {
      id: tab.id,
      url: tab.url,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
      active: tab.active,
      incognito: tab.incognito,
      windowId: tab.windowId,
      index: tab.index,
      status: tab.status,
      lastAccessed: Date.now()
    };
  }

  /**
   * Get all tracked tabs
   */
  getAllTabs() {
    return Array.from(this.tabs.values());
  }

  /**
   * Event emitter pattern
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[TabTracker] Error in ${event} callback:`, error);
      }
    });
  }
}

export default TabTracker;