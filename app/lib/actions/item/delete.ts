"use server";

import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getTableInfo } from "../../utils/tableUtils";
import { describeTable } from "../tables/describe";
import { getDocClient } from "../../utils/clientUtils";
import { apiAction } from "../../utils/apiUtils";
import { z } from "zod";

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
