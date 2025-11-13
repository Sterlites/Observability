/**
 * Content Script
 * Captures page-level interactions and JavaScript errors for correlation
 */

(function() {
  'use strict';

  const EXTENSION_ID = chrome.runtime.id;
  let pageLoadTime = Date.now();
  let interactions = [];

  /**
   * Initialize content script
   */
  function initialize() {
    console.log('[Observatory Content] Initialized on:', window.location.href);

    // Track page load performance
    trackPageLoad();

    // Track user interactions
    trackInteractions();

    // Track JavaScript errors
    trackErrors();

    // Track AJAX/Fetch requests from page
    interceptXHR();
    interceptFetch();

    // Send initial page info
    sendPageInfo();
  }

  /**
   * Track page load performance
   */
  function trackPageLoad() {
    if (document.readyState === 'complete') {
      capturePerformanceMetrics();
    } else {
      window.addEventListener('load', capturePerformanceMetrics);
    }
  }

  /**
   * Capture performance metrics
   */
  function capturePerformanceMetrics() {
    try {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        sendMessage({
          type: 'PAGE_PERFORMANCE',
          data: {
            url: window.location.href,
            loadTime: perfData.loadEventEnd - perfData.fetchStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
            firstPaint: getFirstPaint(),
            resources: performance.getEntriesByType('resource').length,
            timestamp: Date.now()
          }
        });
      }
    } catch (error) {
      console.error('[Observatory Content] Error capturing performance:', error);
    }
  }

  /**
   * Get first paint time
   */
  function getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  /**
   * Track user interactions
   */
  function trackInteractions() {
    const events = ['click', 'submit', 'input', 'change'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        const interaction = {
          type: eventType,
          target: getElementPath(e.target),
          timestamp: Date.now(),
          url: window.location.href
        };
        
        interactions.push(interaction);

        // Keep only last 100 interactions
        if (interactions.length > 100) {
          interactions.shift();
        }

        // Send significant interactions immediately
        if (eventType === 'submit' || eventType === 'click') {
          sendMessage({
            type: 'USER_INTERACTION',
            data: interaction
          });
        }
      }, true);
    });
  }

  /**
   * Get element path for identification
   */
  function getElementPath(element) {
    if (!element) return '';
    
    const path = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      } else if (current.className) {
        selector += `.${Array.from(current.classList).join('.')}`;
      }
      
      path.unshift(selector);
      current = current.parentElement;
      
      if (path.length > 5) break; // Limit depth
    }
    
    return path.join(' > ');
  }

  /**
   * Track JavaScript errors
   */
  function trackErrors() {
    window.addEventListener('error', (event) => {
      sendMessage({
        type: 'JS_ERROR',
        data: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error ? event.error.stack : null,
          url: window.location.href,
          timestamp: Date.now()
        }
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      sendMessage({
        type: 'PROMISE_REJECTION',
        data: {
          reason: event.reason,
          url: window.location.href,
          timestamp: Date.now()
        }
      });
    });
  }

  /**
   * Intercept XMLHttpRequest
   */
  function interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._observatoryData = {
        method: method,
        url: url,
        startTime: Date.now()
      };
      return originalOpen.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      if (this._observatoryData) {
        this.addEventListener('load', function() {
          sendMessage({
            type: 'XHR_COMPLETE',
            data: {
              ...this._observatoryData,
              status: this.status,
              statusText: this.statusText,
              duration: Date.now() - this._observatoryData.startTime,
              url: window.location.href,
              timestamp: Date.now()
            }
          });
        });

        this.addEventListener('error', function() {
          sendMessage({
            type: 'XHR_ERROR',
            data: {
              ...this._observatoryData,
              url: window.location.href,
              timestamp: Date.now()
            }
          });
        });
      }
      return originalSend.apply(this, args);
    };
  }

  /**
   * Intercept Fetch API
   */
  function interceptFetch() {
    const originalFetch = window.fetch;

    window.fetch = function(...args) {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const method = args[1]?.method || 'GET';

      return originalFetch.apply(this, args)
        .then(response => {
          sendMessage({
            type: 'FETCH_COMPLETE',
            data: {
              url: url,
              method: method,
              status: response.status,
              statusText: response.statusText,
              duration: Date.now() - startTime,
              pageUrl: window.location.href,
              timestamp: Date.now()
            }
          });
          return response;
        })
        .catch(error => {
          sendMessage({
            type: 'FETCH_ERROR',
            data: {
              url: url,
              method: method,
              error: error.message,
              pageUrl: window.location.href,
              timestamp: Date.now()
            }
          });
          throw error;
        });
    };
  }

  /**
   * Send page information
   */
  function sendPageInfo() {
    sendMessage({
      type: 'PAGE_INFO',
      data: {
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Send message to background script
   */
  function sendMessage(message) {
    try {
      chrome.runtime.sendMessage(message).catch(() => {
        // Extension context invalidated, ignore
      });
    } catch (error) {
      // Ignore errors when extension is reloaded
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();