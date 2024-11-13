"use server";

import { z } from "zod";
import { apiAction } from "../../utils/apiUtils";
import { purgeTable } from "./purgeTableUtils";

export const purgeTablesAPI = apiAction()
  .schema(
    z.object({
      tables: z.array(z.string()),
    }),
  )
  .inputType()
  .onExecute(async ({ values: { tables } }) => {
    tables.forEach(async (tableName) => {
      await purgeTable(tableName);
    });
  });
