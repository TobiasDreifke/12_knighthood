#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS_ROOT, UNUSED_ASSETS_ROOT, findUnusedAssets } from './check-assets.mjs';

/**
 * CLI utility that relocates unused assets (based on `check-assets`) into the root-level `00_unused_assets` folder.
 *
 * Run from the project root:
 *
 * ```bash
 * node scripts/move-unused-assets.mjs
 * ```
 *
 * Each unused asset is moved under `00_unused_assets/...`, preserving subdirectories.
 */
ensureDir(UNUSED_ASSETS_ROOT);

const { unusedAssets } = findUnusedAssets();
const assetsToMove = [...unusedAssets];

if (!assetsToMove.length) {
    console.log('No unused assets to move.');
    process.exit(0);
}

let movedCount = 0;
for (const relPath of assetsToMove) {
    const source = path.join(ASSETS_ROOT, relPath);
    if (!fs.existsSync(source)) continue;
    const destination = path.join(UNUSED_ASSETS_ROOT, relPath);
    ensureDir(path.dirname(destination));
    fs.renameSync(source, destination);
    movedCount += 1;
    console.log(`Moved: ${relPath}`);
}

console.log(`\nMoved ${movedCount} unused asset(s) into 00_unused_assets.`);

/**
 * Creates a directory path recursively if it doesn't exist.
 *
 * @param {string} dirPath
 */
function ensureDir(dirPath) {
	fs.mkdirSync(dirPath, { recursive: true });
}
