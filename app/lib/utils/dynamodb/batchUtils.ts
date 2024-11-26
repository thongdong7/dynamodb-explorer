import {
  AttributeValue,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { Command } from "@smithy/types";
import { chunk } from "lodash";
import { getClient } from "./clientUtils";

type Callback<Item> = (items: Item[]) => Command<any, any, any, any, any>;
const chunkSize = 25;

export const chunkExecute = async <Item>(
  items: Item[],
  callback: Callback<Item>,
) => {
  const client = getClient();

  for (const _chunk of chunk(items, chunkSize)) {
    const command = callback(_chunk);
    await client.send(command);
  }
};
export const batchDeleteItems = async (
  items: Record<string, AttributeValue>[],
  tableName: string,
) => {
  await chunkExecute(
    items,
    (_items) =>
      new BatchWriteItemCommand({
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
