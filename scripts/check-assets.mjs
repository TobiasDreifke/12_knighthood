#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * CLI utility that scans project source files for `01_assets` usage to report unused files.
 *
 * Run from the project root:
 *
 * ```bash
 * node scripts/check-assets.mjs
 * ```
 *
 * The script prints the number of asset files, number of detected references,
 * and a sorted list of unused assets (if any).
 */

/**
 * Absolute path to the repository root (assumes script is executed from project dir).
 */
export const PROJECT_ROOT = process.cwd();
/**
 * Absolute path to the asset directory that should be scanned.
 */
export const ASSETS_ROOT = path.join(PROJECT_ROOT, '01_assets');
/**
 * Location where unused assets are archived after cleanup.
 */
export const UNUSED_ASSETS_ROOT = path.join(PROJECT_ROOT, '00_unused_assets');
const SOURCE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.jsx', '.tsx', '.html', '.css', '.json']);
const REFERENCE_REGEX = /['"`]([^'"`]*01_assets[^'"`]+)['"`]/g;

/**
 * Scans project source files for `01_assets` references and reports unused assets.
 *
 * @returns {{assetsCount:number, usedCount:number, unusedAssets:string[]}}
 */
export function findUnusedAssets() {
    const allAssets = collectFiles(ASSETS_ROOT);
    const usedAssets = new Set();

    const sourceFiles = collectFiles(PROJECT_ROOT, filePath => {
        const ext = path.extname(filePath).toLowerCase();
        return SOURCE_EXTENSIONS.has(ext);
    });

    for (const file of sourceFiles) {
        const text = safeReadFile(file);
        if (!text) continue;
        const dir = path.dirname(file);
        let match;
        while ((match = REFERENCE_REGEX.exec(text)) !== null) {
            const rawRef = match[1];
            const resolved = resolveReference(rawRef, dir);
            if (!resolved) continue;
            const rel = path.relative(ASSETS_ROOT, resolved).replace(/\\/g, '/');
            if (!rel.startsWith('..')) {
                usedAssets.add(rel);
            }
        }
    }

    const unusedAssets = [];
    for (const assetPath of allAssets) {
        const rel = path.relative(ASSETS_ROOT, assetPath).replace(/\\/g, '/');
        if (!usedAssets.has(rel)) {
            unusedAssets.push(rel);
        }
    }

    unusedAssets.sort();
    return {
        assetsCount: allAssets.length,
        usedCount: usedAssets.size,
        unusedAssets,
    };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const { assetsCount, usedCount, unusedAssets } = findUnusedAssets();
    console.log(`Scanned ${assetsCount} asset files.`);
    console.log(`Detected ${usedCount} referenced asset paths.`);
    if (unusedAssets.length === 0) {
        console.log('No unused assets detected.');
    } else {
        console.log(`Unused assets (${unusedAssets.length}):`);
        unusedAssets.forEach(asset => console.log(`  - ${asset}`));
    }
}

/**
 * Recursively collects files rooted at `root`, optionally filtering by extension.
 *
 * @param {string} root
 * @param {(filePath:string) => boolean} [filterFn]
 * @returns {string[]}
 */
function collectFiles(root, filterFn = null) {
    const results = [];
    const stack = [root];
    while (stack.length) {
        const current = stack.pop();
        const stat = safeStat(current);
        if (!stat) continue;
        if (stat.isDirectory()) {
            const entries = safeReadDir(current);
            entries.forEach(entry => stack.push(path.join(current, entry)));
        } else if (!filterFn || filterFn(current)) {
            results.push(current);
        }
    }
    return results;
}

/**
 * Attempts to resolve a referenced asset path to an absolute file path.
 *
 * @param {string} ref
 * @param {string} baseDir
 * @returns {string|null}
 */
function resolveReference(ref, baseDir) {
    const cleaned = stripQuery(ref.trim());
    let candidate;
    if (cleaned.startsWith('./01_assets')) {
        candidate = path.resolve(PROJECT_ROOT, cleaned.slice(2));
    } else if (cleaned.startsWith('01_assets')) {
        candidate = path.resolve(PROJECT_ROOT, cleaned);
    } else if (cleaned.startsWith('../') || cleaned.startsWith('..\\')) {
        candidate = path.resolve(baseDir, cleaned);
    } else if (cleaned.startsWith('./') || cleaned.startsWith('.\\')) {
        candidate = path.resolve(baseDir, cleaned.slice(2));
    } else if (cleaned.startsWith('/')) {
        candidate = path.resolve(PROJECT_ROOT, cleaned.slice(1));
    } else {
        candidate = path.resolve(PROJECT_ROOT, cleaned);
    }
    const normalized = path.normalize(candidate);
    return fs.existsSync(normalized) ? normalized : null;
}

function stripQuery(value) {
	const idx = value.search(/[?#]/);
	return idx === -1 ? value : value.slice(0, idx);
}

/**
 * Reads a UTF-8 file safely, returning an empty string on error.
 *
 * @param {string} filePath
 * @returns {string}
 */
function safeReadFile(filePath) {
	try {
	 return fs.readFileSync(filePath, 'utf8');
	} catch {
		return '';
	}
}

function safeReadDir(dirPath) {
	try {
		return fs.readdirSync(dirPath);
	} catch {
		return [];
	}
}

function safeStat(target) {
	try {
		return fs.statSync(target);
	} catch {
		return null;
    }
}
