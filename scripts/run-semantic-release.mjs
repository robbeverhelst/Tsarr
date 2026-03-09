#!/usr/bin/env node

import { appendFileSync } from 'node:fs';
import semanticRelease from 'semantic-release';

const result = await semanticRelease(
  {},
  {
    cwd: process.cwd(),
    env: process.env,
    stdout: process.stdout,
    stderr: process.stderr,
  },
);

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
