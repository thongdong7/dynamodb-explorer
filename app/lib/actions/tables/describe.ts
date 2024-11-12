"use server";

import {
  DescribeTableCommand,
  DescribeTableCommandOutput,
  ListTablesCommand,
  ListTablesCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { getClient } from "../../utils/clientUtils";

export interface ListTablesResult extends ListTablesCommandOutput {
  tables: DescribeTableCommandOutput[];
}

export const listAllTables = async (): Promise<ListTablesResult> => {
  const client = getClient();
  const command = new ListTablesCommand({
    Limit: 100,
  });

  const res = await client.send(command);

  const tableNames = res.TableNames ?? [];

  let tables: DescribeTableCommandOutput[] = [];
  if (tableNames) {
    // Describe tables
    tables = await Promise.all(
      tableNames.map((tableName) => describeTable(tableName)),
    );
  }
  return {
    ...res,
    tables,
  };
};

export const describeTable = async (tableName: string) => {
  const command = new DescribeTableCommand({
    TableName: tableName,
  });

  const res = await getClient().send(command);
  return res;
};
