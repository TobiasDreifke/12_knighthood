#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS_ROOT, findUnusedAssets } from './check-assets.mjs';

const TARGET_ROOT = path.join(ASSETS_ROOT, 'unused_assets');
ensureDir(TARGET_ROOT);

const { unusedAssets } = findUnusedAssets();
const assetsToMove = unusedAssets.filter(asset => !asset.startsWith('unused_assets/'));

if (!assetsToMove.length) {
    console.log('No unused assets to move.');
    process.exit(0);
}

let movedCount = 0;
for (const relPath of assetsToMove) {
    const source = path.join(ASSETS_ROOT, relPath);
    if (!fs.existsSync(source)) continue;
    const destination = path.join(TARGET_ROOT, relPath);
    ensureDir(path.dirname(destination));
    fs.renameSync(source, destination);
    movedCount += 1;
    console.log(`Moved: ${relPath}`);
}

console.log(`\nMoved ${movedCount} unused asset(s) into 01_assets/unused_assets.`);

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}
