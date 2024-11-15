"use server";

import { z } from "zod";
import { apiAction } from "../../utils/apiUtils";
import { getClient, getDocClient } from "../../utils/clientUtils";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

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
