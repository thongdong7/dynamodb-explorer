"use server";

import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { getDocClient } from "../../utils/dynamodb/clientUtils";
import { getTableInfo } from "../../utils/tableUtils";
import { describeTable } from "../tables/describe";

export const getItem = async (tableName: string, key: Record<string, any>) => {
  const table = await describeTable(tableName);
  if (!table) {
    throw new Error(`Table not found: ${tableName}`);
  }
  const tableInfo = getTableInfo(table);

  const _key: Record<string, any> = {};
  _key[tableInfo.pk] = key[tableInfo.pk];
  if (tableInfo.sk) {
    _key[tableInfo.sk] = key[tableInfo.sk];
  }
  const result = await getDocClient().send(
    new GetCommand({
      TableName: tableName,
      Key: _key,
    }),
  );

  return { item: result.Item, table };
};
