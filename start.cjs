const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

const distServer = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(distServer)) {
  console.log('[Loka Cafe] dist/server.cjs not found. Building server bundle automatically...');
  try {
    execSync('npx esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs', {
      stdio: 'inherit'
    });
    console.log('[Loka Cafe] Server bundle built successfully.');
  } catch (err) {
    console.warn('[Loka Cafe] esbuild build failed, falling back to tsx runner...', err.message);
    const child = spawn('npx', ['tsx', 'server.ts'], { stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code || 0));
    return;
  }
}

// Start compiled production server
require(distServer);
