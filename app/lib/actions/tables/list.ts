"use server";

import {
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { getClient, getDocClient } from "../../utils/dynamodb/clientUtils";
import {
  ScanCommand as DocScanCommand,
  ScanCommandOutput as DocScanCommandOutput,
} from "@aws-sdk/lib-dynamodb";

export const scanTable = async (
  tableName: string,
  options: Partial<Omit<ScanCommandInput, "TableName">> = {},
): Promise<ScanCommandOutput> => {
  const command = new ScanCommand({
    TableName: tableName,
    ...options,
  });
  const res = await getClient().send(command);

  return res;
};

export const scanDocTable = async (
  tableName: string,
  options: Partial<Omit<ScanCommandInput, "TableName">> = {},
): Promise<DocScanCommandOutput> => {
  const command = new DocScanCommand({
    TableName: tableName,
    ...options,
  });
  const res = await getDocClient().send(command);

  return res;
};

export const queryTable = async (
  tableName: string,
  options: Partial<Omit<QueryCommandInput, "TableName">> = {},
): Promise<QueryCommandOutput> => {
  const command = new QueryCommand({
    TableName: tableName,
    ...options,
  });
  const res = await getClient().send(command);

  return res;
};
