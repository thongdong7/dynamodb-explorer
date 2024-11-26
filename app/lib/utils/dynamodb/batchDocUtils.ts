import { BatchWriteCommand, NativeAttributeValue } from "@aws-sdk/lib-dynamodb";
import { Command } from "@smithy/types";
import { chunk } from "lodash";
import { getClient } from "./clientUtils";

type Callback<Item> = (items: Item[]) => Command<any, any, any, any, any>;
const chunkSize = 25;

export const chunkDocExecute = async <Item>(
  items: Item[],
  callback: Callback<Item>,
) => {
  const client = getClient();

  for (const _chunk of chunk(items, chunkSize)) {
    const command = callback(_chunk);
    await client.send(command);
  }
};
export const batchDocDeleteItems = async (
  items: Record<string, NativeAttributeValue>[],
  tableName: string,
) => {
  await chunkDocExecute(
    items,
    (_items) =>
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: _items.map((item) => ({
            DeleteRequest: {
              Key: item,
            },
          })),
        },
      }),
  );
};
