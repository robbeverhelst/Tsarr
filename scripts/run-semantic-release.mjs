#!/usr/bin/env node

import { appendFileSync } from 'node:fs';
import semanticRelease from 'semantic-release';

let result;
try {
  result = await semanticRelease(
    {},
    {
      cwd: process.cwd(),
      env: process.env,
      stdout: process.stdout,
      stderr: process.stderr,
    }
  );
} catch (error) {
  console.error('Semantic release failed:', error);
  const outputPath = process.env.GITHUB_OUTPUT;
  if (outputPath) {
    appendFileSync(outputPath, 'released=false\n');
  }
  process.exit(1);
}

const outputPath = process.env.GITHUB_OUTPUT;

if (!outputPath) {
  process.exit(0);
}

if (!result) {
  appendFileSync(outputPath, 'released=false\n');
  process.exit(0);
}

appendFileSync(outputPath, 'released=true\n');
appendFileSync(outputPath, `version=${result.nextRelease.version}\n`);
