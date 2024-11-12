import { DynamoDBClient, ListBackupsCommand } from "@aws-sdk/client-dynamodb";
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
        clc.red("dynamodb-admin is only intended for local development"),
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

function loadDynamoConfig() {
  const dynamoConfig = {
    endpoint: "http://localhost:8000",
    sslEnabled: false,
    region: "ap-southeast-1",
    accessKeyId: "a",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "a",
  };

  loadDynamoEndpoint(dynamoConfig);

  // if (AWS.config) {
  //   if (AWS.config.region !== undefined) {
  //     dynamoConfig.region = AWS.config.region;
  //   }

  //   if (AWS.config.credentials) {
  //     if (AWS.config.credentials.accessKeyId !== undefined) {
  //       dynamoConfig.accessKeyId = AWS.config.credentials.accessKeyId;
  //     }
  //   }
  // }

  if (process.env.AWS_REGION) {
    dynamoConfig.region = process.env.AWS_REGION;
  }

  if (process.env.AWS_ACCESS_KEY_ID) {
    dynamoConfig.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  }

  return dynamoConfig;
}

let client: DynamoDBClient | undefined;

export function getClient(): DynamoDBClient {
  if (!client) {
    client = new DynamoDBClient(loadDynamoConfig());
  }

  return client;
}
