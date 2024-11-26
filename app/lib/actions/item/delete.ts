"use server";

import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { apiAction } from "../../utils/apiUtils";
import { batchDeleteItems } from "../../utils/dynamodb/batchUtils";
import { getDocClient } from "../../utils/dynamodb/clientUtils";
import { getTableInfo } from "../../utils/tableUtils";
import { describeTable } from "../tables/describe";
import { batchDocDeleteItems } from "../../utils/dynamodb/batchDocUtils";

export const deleteItemAPI = apiAction()
  .schema(z.object({ tableName: z.string(), key: z.record(z.any()) }))
  .inputType()
  .onExecute(async ({ values: { tableName, key } }) => {
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

    await getDocClient().send(
      new DeleteCommand({
        TableName: tableName,
        Key: _key,
      }),
    );

    return true as const;
  });

export const deleteItemsAPI = apiAction()
  .schema(z.object({ tableName: z.string(), keys: z.array(z.record(z.any())) }))
  .inputType()
  .onExecute(async ({ values: { tableName, keys } }) => {
    // console.log("deleteItemsAPI", tableName, keys);
    await batchDocDeleteItems(keys, tableName);

    return true as const;
  });
