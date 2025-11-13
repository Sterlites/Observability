/**
 * Service Worker - Main background script
 * Coordinates all background operations for network observability
 */

import NetworkInterceptor from './network-interceptor.js';
import StorageManager from './storage-manager.js';
import TabTracker from './tab-tracker.js';

class ServiceWorker {
  constructor() {
    this.networkInterceptor = new NetworkInterceptor();
    this.storageManager = new StorageManager();
    this.tabTracker = new TabTracker();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('[Observatory] Service worker initializing...');

    // Initialize storage
    await this.storageManager.initialize();

    // Setup network interception
    this.networkInterceptor.on('request', async (data) => {
      await this.handleNetworkEvent(data);
    });

    // Setup tab tracking
    this.tabTracker.on('tabUpdate', async (tabInfo) => {
      await this.handleTabUpdate(tabInfo);
    });

    // Listen for messages from popup/dashboard
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async response
    });

    // Start intercepting
    this.networkInterceptor.start();
    this.tabTracker.start();

    this.isInitialized = true;
    console.log('[Observatory] Service worker initialized successfully');
  }

  /**
   * Handle network events and persist them
   */
  async handleNetworkEvent(eventData) {
    try {
      // Enrich with tab information
      const tabInfo = await this.tabTracker.getTabInfo(eventData.tabId);
      
      const enrichedData = {
        ...eventData,
        tabTitle: tabInfo?.title || 'Unknown',
        tabUrl: tabInfo?.url || 'Unknown',
        favicon: tabInfo?.favIconUrl || null,
        sessionId: this.getSessionId()
      };

      // Store the event
      await this.storageManager.storeRequest(enrichedData);

      // Broadcast to any listening dashboards
      this.broadcastUpdate(enrichedData);
    } catch (error) {
      console.error('[Observatory] Error handling network event:', error);
    }
  }

  /**
   * Handle tab updates
   */
  async handleTabUpdate(tabInfo) {
    try {
      await this.storageManager.updateTabInfo(tabInfo);
    } catch (error) {
      console.error('[Observatory] Error handling tab update:', error);
    }
  }

  /**
   * Handle messages from UI components
   */
  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_REQUESTS':
          const requests = await this.storageManager.getRequests(message.filters);
          sendResponse({ success: true, data: requests });
          break;

        case 'GET_ANALYTICS':
          const analytics = await this.storageManager.getAnalytics(message.timeRange);
          sendResponse({ success: true, data: analytics });
          break;

        case 'CLEAR_DATA':
          await this.storageManager.clearAll();
          sendResponse({ success: true });
          break;

        case 'GET_STATS':
          const stats = await this.storageManager.getStats();
          sendResponse({ success: true, data: stats });
          break;

        case 'EXPORT_DATA':
          const exportData = await this.storageManager.exportData(message.filters);
          sendResponse({ success: true, data: exportData });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('[Observatory] Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Broadcast updates to connected dashboards
   */
  broadcastUpdate(data) {
    chrome.runtime.sendMessage({
      type: 'NETWORK_UPDATE',
      data: data
    }).catch(() => {
      // No listeners, ignore
    });
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }
}

// Initialize service worker
const serviceWorker = new ServiceWorker();
serviceWorker.initialize();

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Observatory] Extension installed:', details.reason);
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  console.log('[Observatory] Browser startup detected');
});