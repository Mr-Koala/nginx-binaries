# TCP/UDP Stream Support Implementation

This document describes the implementation of TCP/UDP proxy support (nginx stream module) in nginx-binaries.

## Overview

We have added support for building nginx with stream modules, enabling TCP/UDP load balancing and proxying capabilities. This is implemented as a separate `stream` variant to maintain backward compatibility.

## Changes Made

### 1. Build Script Modifications (`scripts/build-nginx`)

- Added conditional stream module compilation based on `VARIANT` environment variable
- Stream modules included when `VARIANT="-stream"` or `ENABLE_STREAM="1"`:
  - `--with-stream` (core stream functionality)
  - `--with-stream_ssl_module` (SSL/TLS support)
  - `--with-stream_realip_module` (real IP handling)
  - `--with-stream_ssl_preread_module` (SNI routing support)
- Modified binary naming to include variant suffix (e.g., `nginx-1.28.0-stream-x86_64-linux`)

### 2. CI/CD Configuration (`.github/workflows/binaries.yml`)

- Added `stream` variant to build matrix for all platforms:
  - Linux (x86_64, aarch64, ppc64le)
  - macOS (x86_64)
  - Windows (x86_64)
- Updated job names and artifact names to include variant information
- Added `VARIANT` environment variable to build steps

### 3. Documentation Updates (`README.adoc`)

- Added stream variant example in usage section
- Updated binaries table to show `stream` variant availability
- Added comprehensive "Stream Module Support" section with:
  - List of included stream modules
  - Usage examples for downloading stream variant
  - Configuration examples for TCP proxy and SSL passthrough
  - References to example files

### 4. Example Files

**`examples/nginx-stream.conf`**
- Complete nginx configuration demonstrating stream capabilities
- Examples for MySQL, Redis, PostgreSQL proxying
- SSL passthrough with SNI routing
- UDP load balancing (DNS)
- Access control examples

**`examples/download-stream-nginx.js`**
- Node.js script demonstrating how to download and use stream variant
- Automatic fallback to regular nginx if stream variant unavailable
- Stream module detection functionality
- Simple test configuration and startup

### 5. Testing

**`integration-tests/stream.test.ts`**
- Tests for stream variant availability
- Verification of stream binary downloads
- Validation of variant differentiation
- Comprehensive test coverage for stream functionality

### 6. Package Scripts (`package.json`)

Added convenience scripts:
- `npm run test:stream` - Run stream-specific tests
- `npm run example:stream` - Run stream example
- `npm run demo:stream` - Build and run stream demo

## Usage

### Download nginx with stream support:

```javascript
import { NginxBinary } from 'nginx-binaries'

const nginxPath = await NginxBinary.download({
  version: '1.28.x',
  variant: 'stream'  // Request stream variant
})
```

### Check available variants:

```javascript
const variants = await NginxBinary.variants()
console.log(variants) // ['', 'stream']
```

### Basic TCP proxy configuration:

```nginx
stream {
    upstream backend {
        server 192.168.1.10:3306;
        server 192.168.1.11:3306;
    }
    
    server {
        listen 3306;
        proxy_pass backend;
    }
}
```

## Binary Naming Convention

- Default variant: `nginx-1.28.0-x86_64-linux`
- Stream variant: `nginx-1.28.0-stream-x86_64-linux`

## Backward Compatibility

- Existing users are not affected - default variant remains unchanged
- Stream functionality is opt-in via the `variant: 'stream'` parameter
- All existing APIs continue to work as before

## Testing the Implementation

1. **Run stream tests:**
   ```bash
   npm run test:stream
   ```

2. **Try the example:**
   ```bash
   npm run example:stream
   ```

3. **Manual testing:**
   ```bash
   node -e "
   const { NginxBinary } = require('./lib');
   NginxBinary.variants().then(console.log);
   "
   ```

## Future Enhancements

1. **Additional stream modules** could be added:
   - `ngx_stream_geoip_module` for geographic-based routing
   - `ngx_stream_limit_conn_module` for connection limiting
   - `ngx_stream_access_module` for IP-based access control

2. **Platform-specific optimizations**:
   - Consider different module sets for different platforms
   - Platform-specific performance tuning

3. **Integration with existing tools**:
   - Docker image variants
   - Kubernetes deployment examples
   - Monitoring and metrics collection

## Notes

- Stream modules are statically compiled into the binary
- No additional runtime dependencies required
- Full compatibility with existing HTTP functionality
- Suitable for production use in containerized environments

## Files Modified

- `scripts/build-nginx` - Build script with stream support
- `.github/workflows/binaries.yml` - CI configuration
- `README.adoc` - Documentation updates
- `package.json` - Added convenience scripts
- `examples/nginx-stream.conf` - Configuration example
- `examples/download-stream-nginx.js` - Usage example
- `integration-tests/stream.test.ts` - Test coverage

This implementation provides a solid foundation for TCP/UDP proxy capabilities while maintaining the project's existing architecture and compatibility.