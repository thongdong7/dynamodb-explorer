"use server";

import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { z } from "zod";
import { apiAction } from "../../utils/apiUtils";
import { getClient } from "../../utils/dynamodb/clientUtils";

export const deleteTablesAPI = apiAction()
  .schema(
    z.object({
      tables: z.array(z.string()),
    }),
  )
  .inputType()
  .onExecute(async ({ values: { tables } }) => {
    await Promise.all(
      tables.map((tableName) =>
        getClient().send(new DeleteTableCommand({ TableName: tableName })),
      ),
    );
  });
