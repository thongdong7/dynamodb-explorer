"use server";

import {
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { getClient } from "../../utils/clientUtils";

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
