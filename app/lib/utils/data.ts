// const path = require("path");
// const fs = require("fs");
// const os = require("os");
// const errorhandler = require("errorhandler");
// const {
//   extractKey,
//   extractKeysForItems,
//   parseKey,
//   doSearch,
// } = require("./util");
// const { purgeTable } = require("./actions/purgeTable");

import { extractKey, extractKeysForItems, parseKey, doSearch } from "./util";
import { purgeTable } from "./purgeTable";
import fs from "fs";
import os from "os";
import path from "path";
import clc from "cli-color";
import AWS, { AWSError, DynamoDB } from "aws-sdk";

function loadDynamoEndpoint(env, dynamoConfig) {
  if (typeof env.DYNAMO_ENDPOINT === "string") {
    if (env.DYNAMO_ENDPOINT.indexOf(".amazonaws.com") > -1) {
      console.error(
        clc.red("dynamodb-admin is only intended for local development"),
      );
      process.exit(1);
    }
    dynamoConfig.endpoint = env.DYNAMO_ENDPOINT;
    dynamoConfig.sslEnabled = env.DYNAMO_ENDPOINT.indexOf("https://") === 0;
  } else {
    console.log(
      clc.yellow(
        "  DYNAMO_ENDPOINT is not defined (using default of http://localhost:8000)",
      ),
    );
  }
}

/**
 * Create the configuration for the local dynamodb instance.
 *
 * Region and AccessKeyId are determined as follows:
 *   1) Look at local aws configuration in ~/.aws/credentials
 *   2) Look at env variables env.AWS_REGION and env.AWS_ACCESS_KEY_ID
 *   3) Use default values 'us-east-1' and 'key'
 *
 * @param env - the process environment
 * @param AWS - the AWS SDK object
 * @returns {{endpoint: string, sslEnabled: boolean, region: string, accessKeyId: string}}
 */
function loadDynamoConfig(env, AWS) {
  const dynamoConfig = {
    endpoint: "http://localhost:8000",
    sslEnabled: false,
    region: "us-east-1",
    accessKeyId: "key",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "secret",
  };

  loadDynamoEndpoint(env, dynamoConfig);

  if (AWS.config) {
    if (AWS.config.region !== undefined) {
      dynamoConfig.region = AWS.config.region;
    }

    if (AWS.config.credentials) {
      if (AWS.config.credentials.accessKeyId !== undefined) {
        dynamoConfig.accessKeyId = AWS.config.credentials.accessKeyId;
      }
    }
  }

  if (env.AWS_REGION) {
    dynamoConfig.region = env.AWS_REGION;
  }

  if (env.AWS_ACCESS_KEY_ID) {
    dynamoConfig.accessKeyId = env.AWS_ACCESS_KEY_ID;
  }

  return dynamoConfig;
}

const createAwsConfig = (AWS) => {
  const env = process.env;
  const dynamoConfig = loadDynamoConfig(env, AWS);

  console.log(
    clc.blackBright(`  database endpoint: \t${dynamoConfig.endpoint}`),
  );
  console.log(clc.blackBright(`  region: \t\t${dynamoConfig.region}`));
  console.log(
    clc.blackBright(`  accessKey: \t\t${dynamoConfig.accessKeyId}\n`),
  );

  return dynamoConfig;
};

function getHomeDir() {
  const env = process.env;
  const home =
    env.HOME ||
    env.USERPROFILE ||
    (env.HOMEPATH ? (env.HOMEDRIVE || "C:/") + env.HOMEPATH : null);

  if (home) {
    return home;
  }

  if (typeof os.homedir === "function") {
    return os.homedir();
  }

  return null;
}
let dynamodb: AWS.DynamoDB;
let docClient: AWS.DynamoDB.DocumentClient;
const homeDir = getHomeDir();

if (
  homeDir &&
  fs.existsSync(path.join(homeDir, ".aws", "credentials")) &&
  fs.existsSync(path.join(homeDir, ".aws", "config"))
) {
  process.env.AWS_SDK_LOAD_CONFIG = 1;
}

dynamodb = new AWS.DynamoDB(createAwsConfig(AWS));

docClient = new AWS.DynamoDB.DocumentClient({ service: dynamodb });

// export const listTables = (...args) => dynamodb.listTables(...args).promise();
export const listTables = (
  callback?: (err: AWSError, data: DynamoDB.Types.ListTablesOutput) => void,
) => {
  return dynamodb.listTables(callback).promise();
};
// export const describeTable = (...args) =>
//   dynamodb.describeTable(...args).promise();
export const describeTable = (
  params: DynamoDB.Types.DescribeTableInput,
  callback?: (err: AWSError, data: DynamoDB.Types.DescribeTableOutput) => void,
) => {
  return dynamodb.describeTable(params, callback).promise();
};

// export const getItem = (...args) => docClient.get(...args).promise();
export const getItem = (
  params: AWS.DynamoDB.DocumentClient.GetItemInput,
  callback?: (
    err: AWSError,
    data: AWS.DynamoDB.DocumentClient.GetItemOutput,
  ) => void,
) => {
  return docClient.get(params, callback).promise();
};
// export const putItem = (...args) => docClient.put(...args).promise();
export const putItem = (
  params: AWS.DynamoDB.DocumentClient.PutItemInput,
  callback?: (
    err: AWSError,
    data: AWS.DynamoDB.DocumentClient.PutItemOutput,
  ) => void,
) => {
  return docClient.put(params, callback).promise();
};
// export const deleteItem = (...args) => docClient.delete(...args).promise();
export const deleteItem = (
  params: AWS.DynamoDB.DocumentClient.DeleteItemInput,
  callback?: (
    err: AWSError,
    data: AWS.DynamoDB.DocumentClient.DeleteItemOutput,
  ) => void,
) => {
  return docClient.delete(params, callback).promise();
};
