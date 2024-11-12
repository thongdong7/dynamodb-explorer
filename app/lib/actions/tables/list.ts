"use server";

import { ScanCommand, ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import { getClient } from "../../utils/clientUtils";

export const scanTable = async (
  tableName: string,
): Promise<ScanCommandOutput> => {
  const command = new ScanCommand({
    TableName: tableName,
  });
  const res = await getClient().send(command);

  return res;
};
