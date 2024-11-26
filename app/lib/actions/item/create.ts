"use server";

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { apiAction } from "../../utils/apiUtils";
import { getDocClient } from "../../utils/dynamodb/clientUtils";

export const putItemAPI = apiAction()
  .schema(
    z.object({
      TableName: z.string(),
      Item: z.record(z.any()),
    }),
  )
  .inputType()
  .onExecute(async ({ values: { TableName, Item } }) => {
    return await getDocClient().send(
      new PutCommand({
        TableName,
        Item,
      }),
    );
  });
