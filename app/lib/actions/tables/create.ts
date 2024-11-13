"use server";

import { z } from "zod";
import { apiAction } from "../../utils/apiUtils";
import { getClient } from "../../utils/clientUtils";
import { CreateTableCommand, KeySchemaElement } from "@aws-sdk/client-dynamodb";

export const createTableAPI = apiAction()
  .schema(
    z.object({
      TableName: z.string(),
      HashAttrName: z.string(),
      HashAttrType: z.enum(["S", "N", "B"]),
      RangeAttrName: z.string().optional(),
      RangeAttrType: z.enum(["S", "N", "B"]).optional(),
      ReadCapacityUnits: z.coerce.number().optional().default(1),
      WriteCapacityUnits: z.coerce.number().optional().default(1),
    }),
  )
  .inputType()
  .onExecute(
    async ({
      values: {
        TableName,
        HashAttrName,
        HashAttrType,
        RangeAttrName,
        RangeAttrType,
        ReadCapacityUnits,
        WriteCapacityUnits,
      },
    }) => {
      const attrDefs = [
        {
          AttributeName: HashAttrName,
          AttributeType: HashAttrType,
        },
      ];
      const keySchema: KeySchemaElement[] = [
        {
          AttributeName: HashAttrName,
          KeyType: "HASH",
        },
      ];

      if (RangeAttrName && RangeAttrType) {
        attrDefs.push({
          AttributeName: RangeAttrName,
          AttributeType: RangeAttrType,
        });
      }

      if (RangeAttrName && RangeAttrType) {
        keySchema.push({
          AttributeName: RangeAttrName,
          KeyType: "RANGE",
        });
      }
      await getClient().send(
        new CreateTableCommand({
          TableName,
          AttributeDefinitions: attrDefs,
          KeySchema: keySchema,
          ProvisionedThroughput: {
            ReadCapacityUnits,
            WriteCapacityUnits,
          },
        }),
      );
    },
  );
