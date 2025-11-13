/**
 * Network Interceptor
 * Captures all HTTP(S) requests and responses using chrome.webRequest API
 */

class NetworkInterceptor {
  constructor() {
    this.listeners = new Map();
    this.requestMap = new Map(); // Track request lifecycle
    this.isActive = false;
  }

  /**
   * Start intercepting network traffic
   */
  start() {
    if (this.isActive) return;

    console.log('[NetworkInterceptor] Starting network interception...');

    // Intercept request initiation
    chrome.webRequest.onBeforeRequest.addListener(
      this.handleBeforeRequest.bind(this),
      { urls: ['<all_urls>'] },
      ['requestBody']
    );

    // Intercept request headers being sent
    chrome.webRequest.onBeforeSendHeaders.addListener(
      this.handleBeforeSendHeaders.bind(this),
      { urls: ['<all_urls>'] },
      ['requestHeaders', 'extraHeaders']
    );

    // Intercept response headers received
    chrome.webRequest.onHeadersReceived.addListener(
      this.handleHeadersReceived.bind(this),
      { urls: ['<all_urls>'] },
      ['responseHeaders', 'extraHeaders']
    );

    // Intercept request completion
    chrome.webRequest.onCompleted.addListener(
      this.handleCompleted.bind(this),
      { urls: ['<all_urls>'] },
      ['responseHeaders']
    );

    // Intercept request errors
    chrome.webRequest.onErrorOccurred.addListener(
      this.handleError.bind(this),
      { urls: ['<all_urls>'] }
    );

    this.isActive = true;
    console.log('[NetworkInterceptor] Network interception started');
  }

  /**
   * Stop intercepting
   */
  stop() {
    if (!this.isActive) return;
    
    chrome.webRequest.onBeforeRequest.removeListener(this.handleBeforeRequest);
    chrome.webRequest.onBeforeSendHeaders.removeListener(this.handleBeforeSendHeaders);
    chrome.webRequest.onHeadersReceived.removeListener(this.handleHeadersReceived);
    chrome.webRequest.onCompleted.removeListener(this.handleCompleted);
    chrome.webRequest.onErrorOccurred.removeListener(this.handleError);
    
    this.isActive = false;
    console.log('[NetworkInterceptor] Network interception stopped');
  }

  /**
   * Handle request initiation
   */
  handleBeforeRequest(details) {
    const requestData = {
      id: details.requestId,
      url: details.url,
      method: details.method,
      type: details.type,
      tabId: details.tabId,
      frameId: details.frameId,
      initiator: details.initiator || details.documentUrl,
      timestamp: details.timeStamp,
      startTime: Date.now(),
      requestBody: this.parseRequestBody(details.requestBody)
    };

    this.requestMap.set(details.requestId, requestData);
  }

  /**
   * Handle request headers being sent
   */
  handleBeforeSendHeaders(details) {
    const requestData = this.requestMap.get(details.requestId);
    if (requestData) {
      requestData.requestHeaders = this.parseHeaders(details.requestHeaders);
      requestData.cookies = this.extractCookies(details.requestHeaders);
    }
  }

  /**
   * Handle response headers received
   */
  handleHeadersReceived(details) {
    const requestData = this.requestMap.get(details.requestId);
    if (requestData) {
      requestData.statusCode = details.statusCode;
      requestData.statusLine = details.statusLine;
      requestData.responseHeaders = this.parseHeaders(details.responseHeaders);
      requestData.contentType = this.extractContentType(details.responseHeaders);
      requestData.responseTime = Date.now() - requestData.startTime;
    }
  }

  /**
   * Handle request completion
   */
  handleCompleted(details) {
    const requestData = this.requestMap.get(details.requestId);
    if (requestData) {
      requestData.completed = true;
      requestData.endTime = Date.now();
      requestData.duration = requestData.endTime - requestData.startTime;
      requestData.fromCache = details.fromCache || false;
      requestData.ip = details.ip;
      
      // Emit event for storage
      this.emit('request', requestData);
      
      // Clean up after delay to allow any late events
      setTimeout(() => {
        this.requestMap.delete(details.requestId);
      }, 5000);
    }
  }

  /**
   * Handle request errors
   */
  handleError(details) {
    const requestData = this.requestMap.get(details.requestId);
    if (requestData) {
      requestData.error = details.error;
      requestData.completed = false;
      requestData.endTime = Date.now();
      requestData.duration = requestData.endTime - requestData.startTime;
      
      // Emit event for storage
      this.emit('request', requestData);
      
      // Clean up
      setTimeout(() => {
        this.requestMap.delete(details.requestId);
      }, 5000);
    }
  }

  /**
   * Parse request body
   */
  parseRequestBody(requestBody) {
    if (!requestBody) return null;

    try {
      if (requestBody.formData) {
        return { type: 'formData', data: requestBody.formData };
      }
      if (requestBody.raw) {
        // Limit size to prevent memory issues
        const decoder = new TextDecoder('utf-8');
        const data = requestBody.raw
          .slice(0, 3)
          .map(item => decoder.decode(item.bytes))
          .join('');
        return { type: 'raw', data: data.substring(0, 10000) };
      }
    } catch (error) {
      console.error('[NetworkInterceptor] Error parsing request body:', error);
    }
    return null;
  }

  /**
   * Parse headers into key-value object
   */
  parseHeaders(headers) {
    if (!headers) return {};
    
    const parsed = {};
    headers.forEach(header => {
      parsed[header.name.toLowerCase()] = header.value;
    });
    return parsed;
  }

  /**
   * Extract cookies from headers
   */
  extractCookies(headers) {
    if (!headers) return [];
    
    const cookieHeader = headers.find(h => h.name.toLowerCase() === 'cookie');
    if (!cookieHeader) return [];
    
    return cookieHeader.value.split(';').map(c => c.trim());
  }

  /**
   * Extract content type from response headers
   */
  extractContentType(headers) {
    if (!headers) return null;
    
    const contentTypeHeader = headers.find(h => h.name.toLowerCase() === 'content-type');
    return contentTypeHeader ? contentTypeHeader.value : null;
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
        console.error(`[NetworkInterceptor] Error in ${event} callback:`, error);
      }
    });
  }
}

export default NetworkInterceptor;