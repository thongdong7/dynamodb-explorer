#!/usr/bin/env node

import { nextStart } from "next/dist/cli/next-start";

console.log(__dirname);

const distDir = __dirname;
const rootDir = distDir + "/..";
console.log(rootDir);
nextStart(
  {
    port: 3000,
  },
  rootDir,
);
