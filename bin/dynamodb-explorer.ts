#!/usr/bin/env node

import { nextStart } from "next/dist/cli/next-start";

import { readFileSync } from "node:fs";

const distDir = __dirname;
const rootDir = distDir + "/..";

const { description, version } = JSON.parse(
  readFileSync(rootDir + "/package.json", {
    encoding: "utf8",
  }),
);

import { Command } from "commander";
const program = new Command();

program
  .name("dynamodb-explorer")
  .description(description)
  .version(version, "-v, --version", "output the current version");

program
  .description("Start the DynamoDB Explorer server")
  .option("-p, --port <port>", "port to listen on", "8001")
  .option("-H, --host <host>", "host to listen on", "localhost")
  .option(
    "-e, --dynamo-endpoint <endpoint>",
    "DynamoDB endpoint",
    "http://localhost:8000",
  )
  .action((options) => {
    // console.log(options);
    process.env.DYNAMO_ENDPOINT = options.dynamoEndpoint;
    console.log("DynamoDB endpoint: " + process.env.DYNAMO_ENDPOINT);
    nextStart(
      {
        port: parseInt(options.port),
        hostname: options.host,
      },
      rootDir,
    );
  });
program.parse();
