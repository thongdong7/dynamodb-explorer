"use server";

import {
  DescribeTableCommand,
  DescribeTableCommandOutput,
  ListTablesCommand,
  ListTablesCommandOutput,
  TableDescription,
} from "@aws-sdk/client-dynamodb";
import { getClient } from "../../utils/clientUtils";

export interface ListTablesResult extends ListTablesCommandOutput {
  tables: TableDescription[];
}

export const listAllTables = async (): Promise<ListTablesResult> => {
  const client = getClient();
  const command = new ListTablesCommand({
    Limit: 100,
  });

  const res = await client.send(command);

  const tableNames = res.TableNames ?? [];

  let tables: TableDescription[] = [];
  if (tableNames) {
    // Describe tables
    tables = (
      await Promise.all(tableNames.map((tableName) => describeTable(tableName)))
    ).filter((table) => table !== undefined);
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
  return res.Table;
};
