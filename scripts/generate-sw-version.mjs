import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const swPath = resolve('public/sw.js');
const swContent = readFileSync(swPath, 'utf8');

// Generate a timestamp-based version
const currentVersion = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');

// Replace the placeholder with the actual version
const updatedContent = swContent.replace(/REPLACE_WITH_BUILD_VERSION/g, `v${currentVersion}`);

writeFileSync(swPath, updatedContent);

console.log(`✅ Service Worker cache version updated to: v${currentVersion}`);
console.log(`📦 Cache name will be: devprofile-v${currentVersion}`);
console.log('🔄 Old caches will be automatically cleaned up on next deployment');
