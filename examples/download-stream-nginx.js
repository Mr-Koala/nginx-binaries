#!/usr/bin/env node

/**
 * Example: Download and use nginx with stream (TCP/UDP proxy) support
 * 
 * This example demonstrates how to:
 * 1. Download nginx binary with stream module support
 * 2. Start nginx with TCP proxy configuration
 * 3. Test the TCP proxy functionality
 */

const { NginxBinary } = require('nginx-binaries');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function downloadStreamNginx() {
  console.log('🔄 Downloading nginx with stream support...');
  
  try {
    // Download nginx with stream variant
    const nginxPath = await NginxBinary.download({
      version: '1.28.x',
      variant: 'stream',  // This is the key - request stream variant
      // os and arch will be auto-detected
    });
    
    console.log('✅ nginx with stream support downloaded to:', nginxPath);
    
    // Make sure it's executable
    fs.chmodSync(nginxPath, '755');
    
    return nginxPath;
    
  } catch (error) {
    console.error('❌ Failed to download nginx:', error.message);
    
    // Fallback: try to download regular nginx and check if it has stream support
    console.log('🔄 Trying to download regular nginx...');
    try {
      const nginxPath = await NginxBinary.download({
        version: '1.28.x',
        // No variant specified - will get default
      });
      
      console.log('✅ Regular nginx downloaded to:', nginxPath);
      fs.chmodSync(nginxPath, '755');
      
      // Check if it has stream support
      const hasStream = await checkStreamSupport(nginxPath);
      if (hasStream) {
        console.log('✅ Regular nginx already includes stream support!');
        return nginxPath;
      } else {
        console.log('⚠️  Regular nginx does not include stream support');
        return nginxPath; // Return anyway for demonstration
      }
      
    } catch (fallbackError) {
      console.error('❌ Failed to download any nginx:', fallbackError.message);
      throw fallbackError;
    }
  }
}

async function checkStreamSupport(nginxPath) {
  return new Promise((resolve) => {
    const child = spawn(nginxPath, ['-V'], { stdio: 'pipe' });
    let output = '';
    
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', () => {
      const hasStream = output.includes('--with-stream');
      console.log(`🔍 Stream support: ${hasStream ? 'YES' : 'NO'}`);
      if (hasStream) {
        console.log('   Available stream modules:');
        if (output.includes('--with-stream_ssl_module')) {
          console.log('   ✅ stream_ssl_module');
        }
        if (output.includes('--with-stream_realip_module')) {
          console.log('   ✅ stream_realip_module');
        }
        if (output.includes('--with-stream_ssl_preread_module')) {
          console.log('   ✅ stream_ssl_preread_module');
        }
      }
      resolve(hasStream);
    });
  });
}

async function createSimpleStreamConfig(nginxPath) {
  const configPath = path.join(path.dirname(nginxPath), 'nginx-stream-test.conf');
  
  const config = `
# Simple nginx configuration with stream support for testing
worker_processes 1;
error_log stderr info;
pid nginx.pid;

events {
    worker_connections 1024;
}

# HTTP server for status checking
http {
    server {
        listen 8080;
        location / {
            return 200 "nginx with stream support is running\\n";
            add_header Content-Type text/plain;
        }
    }
}

# Stream configuration for TCP proxy
stream {
    # Simple TCP proxy - forwards connections to a backend
    # In this example, we'll proxy port 9999 to port 8080 (our HTTP server)
    server {
        listen 9999;
        proxy_pass 127.0.0.1:8080;
        proxy_timeout 1s;
        proxy_responses 1;
    }
}
`;

  fs.writeFileSync(configPath, config);
  console.log('📝 Created test configuration:', configPath);
  return configPath;
}

async function testNginx(nginxPath, configPath) {
  console.log('🚀 Starting nginx with stream configuration...');
  
  return new Promise((resolve, reject) => {
    const child = spawn(nginxPath, ['-c', configPath, '-g', 'daemon off;'], {
      stdio: 'pipe'
    });
    
    child.stdout.on('data', (data) => {
      console.log('nginx stdout:', data.toString());
    });
    
    child.stderr.on('data', (data) => {
      console.log('nginx stderr:', data.toString());
    });
    
    child.on('error', (error) => {
      console.error('❌ Failed to start nginx:', error);
      reject(error);
    });
    
    // Give nginx a moment to start
    setTimeout(() => {
      console.log('✅ nginx started successfully');
      console.log('🔗 Test URLs:');
      console.log('   Direct HTTP: http://localhost:8080/');
      console.log('   Via TCP proxy: http://localhost:9999/');
      console.log('');
      console.log('💡 You can test the TCP proxy with:');
      console.log('   curl http://localhost:8080/  # Direct connection');
      console.log('   curl http://localhost:9999/  # Through TCP proxy');
      console.log('');
      console.log('⏹️  Press Ctrl+C to stop nginx');
      
      resolve(child);
    }, 1000);
  });
}

async function main() {
  try {
    console.log('🎯 nginx-binaries Stream Support Example');
    console.log('=========================================');
    
    // Step 1: Download nginx with stream support
    const nginxPath = await downloadStreamNginx();
    
    // Step 2: Check what modules are available
    await checkStreamSupport(nginxPath);
    
    // Step 3: Create a test configuration
    const configPath = await createSimpleStreamConfig(nginxPath);
    
    // Step 4: Start nginx and test
    const nginxProcess = await testNginx(nginxPath, configPath);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\\n🛑 Stopping nginx...');
      nginxProcess.kill('SIGTERM');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
}

module.exports = {
  downloadStreamNginx,
  checkStreamSupport,
  createSimpleStreamConfig,
  testNginx
};