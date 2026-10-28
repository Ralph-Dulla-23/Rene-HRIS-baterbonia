#!/usr/bin/env node
/** Validates the canonical NHO screen and AI Studio legacy mirror copies. */
import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
const pairs = [
 ['src/components/nho/NHOMainModule.tsx', 'NHOMainModule.tsx'],
 ['src/components/nho/NHORoleHeader.tsx', 'NHORoleHeader.tsx'],
 ['src/components/nho/ta/NHOTADashboard.tsx', 'NHOTADashboard.tsx'],
];
for (const [canonical, mirror] of pairs) {
 const source = readFileSync(canonical, 'utf8');
 assert.equal(readFileSync(mirror, 'utf8'), source, `${mirror} differs from ${canonical}: stale AI Studio copy`);
 console.log(`PASS synchronized: ${canonical} == ${mirror}`);
}
const app = readFileSync('src/App.tsx', 'utf8');
const main = readFileSync('src/components/nho/NHOMainModule.tsx', 'utf8');
const header = readFileSync('src/components/nho/NHORoleHeader.tsx', 'utf8');
const dashboard = readFileSync('src/components/nho/ta/NHOTADashboard.tsx', 'utf8');
assert.match(app, /import\s+NHOMainModule\s+from\s+["']\.\/components\/nho\/NHOMainModule["']/);
assert.match(main, /import\s+NHORoleHeader\s+from\s+["']\.\/NHORoleHeader["']/);
assert.match(main, /import\s+NHOTADashboard\s+from\s+["']\.\/ta\/NHOTADashboard["']/);
assert.doesNotMatch(header, /NHO V1 Prototype|Interactive Wireframe/);
assert.match(header, /New Hire Orientation/);
assert.match(header, /bg-gradient-to-r/);
assert.match(dashboard, /NHO Applicant Records/);
assert.match(dashboard, /Pending Attendance/);
assert.doesNotMatch(dashboard, /sibs-nho-page-hero/);
console.log('PASS active NHO imports and redesigned content');
