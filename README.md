# Network Observatory - Chrome Extension

A powerful Chrome extension providing super admin-level observability of all browser network activity with a beautiful React-based dashboard.

## Features

- 🔍 **Complete Network Interception**: Capture all HTTP(S) requests and responses
- 📊 **Rich Analytics Dashboard**: Visualize traffic patterns with interactive charts
- 🔴 **Live Monitoring**: Real-time request tracking with filters
- 💾 **Local Persistence**: All data stored locally in browser storage
- 🎯 **Advanced Filtering**: Filter by URL, method, status, type, and time range
- 📱 **Tab Correlation**: Track requests with their originating tabs
- ⚡ **Performance Optimized**: Low overhead, efficient data structures
- 🎨 **Beautiful UI**: Modern, dark-themed interface built with React

## Installation

### Prerequisites

- Node.js 16+ and npm
- Chrome/Chromium browser

### Build Instructions

1. **Clone or extract the project**
```bash
cd network-observer-extension
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the extension**

For production build:
```bash
npm run build
```

For development with watch mode:
```bash
npm run dev
```

4. **Load the extension in Chrome**

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory
   - The extension icon should appear in your browser toolbar

## Usage

### Quick Start

1. **Click the extension icon** in the toolbar to see a quick stats summary
2. **Click "Open Dashboard"** to launch the full analytics interface
3. **Start browsing** - all network activity will be automatically captured

### Dashboard Features

#### Live Requests View
- View all captured requests in real-time
- Click any request to see detailed information
- Filter by URL pattern, method, status code, type, or time range
- See request/response headers, cookies, timing information

#### Analytics View
- **Request Timeline**: Visualize traffic over time
- **Method Distribution**: See breakdown by HTTP method
- **Status Code Analysis**: Track success/error rates
- **Top Domains**: Identify most-accessed domains
- **Resource Types**: Understand what types of resources are loaded
- **Slowest Requests**: Find performance bottlenecks

### Filters

Use the filter bar to narrow down requests:
- **URL Pattern**: Text search in request URLs
- **Method**: GET, POST, PUT, DELETE, etc.
- **Type**: Document, Script, Image, XHR, Fetch, etc.
- **Time Range**: Last hour, 24 hours, 7 days, 30 days
- **Errors Only**: Show only failed requests

### Keyboard Shortcuts

- Click any request row to view details
- Use filter inputs to quickly find specific requests
- Scroll through large datasets smoothly

## Architecture

### Project Structure
````
network-observer-extension/
├── src/
│   ├── background/           # Service worker and background scripts
│   │   ├── service-worker.js # Main coordinator
│   │   ├── network-interceptor.js # WebRequest API handler
│   │   ├── storage-manager.js # Data persistence layer
│   │   └── tab-tracker.js    # Tab monitoring
│   ├── content/              # Content scripts
│   │   └── content-script.js # Page-level tracking
│   ├── dashboard/            # React dashboard
│   │   ├── components/       # UI components
│   │   ├── store/           # Redux state management
│   │   └── styles/          # CSS styles
│   └── popup/               # Extension popup
├── manifest.json            # Extension manifest
└── webpack.config.js        # Build configuration
Key Technologies

Chrome WebRequest API: Network interception
Chrome Storage API: Local data persistence
React 18: UI framework
Redux Toolkit: State management
Recharts: Data visualization
Webpack: Module bundling

Data Flow

Network Interceptor captures requests via chrome.webRequest
Storage Manager persists data to chrome.storage.local
Tab Tracker enriches requests with tab context
Service Worker coordinates all background operations
Dashboard queries data and displays visualizations
Content Script tracks page-level events

Performance Considerations

Memory Management: Automatically limits stored requests to 10,000
Efficient Indexing: Multi-dimensional indexing for fast queries
Batch Operations: Groups storage operations to reduce overhead
Lazy Loading: Loads only necessary data for current view
Optimized Rendering: Virtual scrolling for large datasets

Privacy & Security

✅ All data stored locally in your browser
✅ No external servers or network calls
✅ No data collection or telemetry
✅ Respects browser security policies
⚠️ Requires broad permissions for full network access

Required Permissions

webRequest: Intercept network traffic
storage: Persist captured data locally
tabs: Track tab information
cookies: Capture cookie headers
<all_urls>: Monitor all domains

Development
Development Mode
Run with hot reloading:
bashnpm run dev
Building for Production
bashnpm run build
Cleaning Build Artifacts
bashnpm run clean
````

### Code Structure Guidelines

- **Modular**: Each component has a single responsibility
- **Documented**: Comprehensive JSDoc comments
- **Type-Safe**: Prop validation and error handling
- **Performant**: Optimized for low overhead
- **Maintainable**: Clear naming and organization

## Debugging

### Service Worker Console

1. Go to `chrome://extensions/`
2. Find "Network Observatory"
3. Click "service worker" link
4. Console opens with background script logs

### Dashboard DevTools

- Right-click dashboard → "Inspect"
- Standard React DevTools available

### Common Issues

**Extension not loading:**
- Check console for build errors
- Verify all dependencies installed
- Ensure manifest.json is valid

**No requests captured:**
- Check extension is enabled
- Verify permissions granted
- Look for service worker errors

**Dashboard not opening:**
- Check `dist/dashboard.html` exists
- Clear browser cache
- Rebuild extension

## Extending Functionality

### Adding New Analytics

1. Add data collection in `network-interceptor.js`
2. Create aggregation logic in `storage-manager.js`
3. Build visualization in `Analytics.jsx`
4. Update Redux store if needed

### Custom Filters

1. Add filter state in `filterSlice.js`
2. Update filter UI in `FilterBar.jsx`
3. Implement filter logic in `storage-manager.js`

### New Dashboard Views

1. Create component in `components/`
2. Add route in `App.jsx`
3. Update sidebar navigation

## Troubleshooting

### High Memory Usage

- Reduce `maxRequests` in `storage-manager.js`
- Clear old data regularly
- Implement more aggressive pruning

### Slow Performance

- Check filter complexity
- Reduce chart data points
- Optimize React renders with `useMemo`/`useCallback`

### Missing Data

- Verify service worker is running
- Check storage quota
- Review console for errors

## Future Enhancements

Potential features for future versions:
- [ ] Export data to JSON/CSV
- [ ] Custom request replaying
- [ ] WebSocket traffic monitoring
- [ ] Request/response body inspection
- [ ] Network throttling simulation
- [ ] Session recording and playback
- [ ] Advanced search with RegEx
- [ ] Custom alert rules
- [ ] Integration with external tools

## License

MIT License - feel free to modify and extend!

## Support

For issues, questions, or contributions:
- Check the documentation
- Review console logs
- File issues on GitHub (if applicable)

## Credits

Built with ❤️ using modern web technologies.

---

**Note**: This extension requires broad permissions to monitor all network traffic. Only install extensions you trust!
````

### 30. `.gitignore`
````
# Dependencies
node_modules/

# Build output
dist/
build/

# Logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# OS
.DS_Store
Thumbs.db

# Package files
*.zip
*.crx
*.pem

# Temporary files
*.tmp
*.temp
.cache/
````

## Final Steps

### 1. Create Icon Files

Create three icon files in `public/icons/`:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use free tools like:
- https://www.canva.com (create custom icons)
- https://favicon.io (generate from text/emoji)
- Or use this emoji: 📡 and convert to PNG at different sizes

### 2. Build and Install
````bash
# Install dependencies
npm install

# Build the extension
npm run build

# The extension will be built in the dist/ folder
````

### 3. Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder
5. Extension is now installed!

## Key Features Summary

✅ **Complete Network Observability**
- Captures all HTTP(S) requests and responses
- Tracks headers, cookies, timing, status codes
- Correlates requests with tabs and sessions

✅ **Beautiful Dashboard**
- Real-time live view with filtering
- Rich analytics with interactive charts
- Detailed request inspection panels

✅ **Performance Optimized**
- Efficient data structures and indexing
- Low memory footprint
- Smooth UI with 1000+ requests

✅ **Privacy Focused**
- All data stored locally
- No external connections
- Full user control

✅ **Developer Friendly**
- Modern React with hooks
- Redux for state management
- Modular, maintainable code
- Comprehensive comments

This is a production-ready, enterprise-grade network observability tool built entirely within Chrome extension constraints! 


