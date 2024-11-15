import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import clc from "cli-color";

interface DynamoConfig {
  endpoint: string;
  sslEnabled: boolean;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

function loadDynamoEndpoint(dynamoConfig: DynamoConfig) {
  if (typeof process.env.DYNAMO_ENDPOINT === "string") {
    if (process.env.DYNAMO_ENDPOINT.indexOf(".amazonaws.com") > -1) {
      console.error(
        clc.red("dynamodb-explorer is only intended for local development"),
      );
      process.exit(1);
    }
    dynamoConfig.endpoint = process.env.DYNAMO_ENDPOINT;
    dynamoConfig.sslEnabled =
      process.env.DYNAMO_ENDPOINT.indexOf("https://") === 0;
  } else {
    console.log(
      clc.yellow(
        "  DYNAMO_ENDPOINT is not defined (using default of http://localhost:8000)",
      ),
    );
  }
}

interface Config {
  endpoint: string;
  sslEnabled: boolean;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}
let _config: Config;

export function loadDynamoConfig() {
  if (!_config) {
    const dynamoConfig = {
      endpoint: "http://localhost:8000",
      sslEnabled: false,
      region: "ap-southeast-1",
      accessKeyId: "a",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "a",
    };

    loadDynamoEndpoint(dynamoConfig);

    if (process.env.AWS_REGION) {
      dynamoConfig.region = process.env.AWS_REGION;
    }

    if (process.env.AWS_ACCESS_KEY_ID) {
      dynamoConfig.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    }
    _config = dynamoConfig;
  }

  return _config;
}

let client: DynamoDBClient | undefined;

export function getClient(): DynamoDBClient {
  if (!client) {
    const config = loadDynamoConfig();
    try {
      client = new DynamoDBClient(loadDynamoConfig());
    } catch (e) {
      throw new Error(
        `Failed to create DynamoDB client: ${e}. Endpoint: ${config.endpoint}`,
      );
    }
  }

  return client;
}

let docClient: DynamoDBDocumentClient | undefined;
export function getDocClient(): DynamoDBClient {
  if (!docClient) {
    docClient = DynamoDBDocumentClient.from(getClient());
  }

  return docClient;
}
