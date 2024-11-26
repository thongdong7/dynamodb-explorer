"use server";

import { z } from "zod";
import { apiAction } from "../../utils/apiUtils";
import { getClient } from "../../utils/dynamodb/clientUtils";
import {
  CreateTableCommand,
  CreateTableCommandInput,
  KeySchemaElement,
} from "@aws-sdk/client-dynamodb";

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
      BillingMode: z
        .enum(["PROVISIONED", "PAY_PER_REQUEST"])
        .optional()
        .default("PROVISIONED"),
      indexes: z
        .array(
          z.object({
            name: z.string(),
            type: z.enum(["GSI", "LSI"]),
            HashAttrName: z.string(),
            HashAttrType: z.enum(["S", "N", "B"]),
            RangeAttrName: z.string().optional(),
            RangeAttrType: z.enum(["S", "N", "B"]).optional(),
            ReadCapacityUnits: z.coerce.number().optional().default(1),
            WriteCapacityUnits: z.coerce.number().optional().default(1),
          }),
        )
        .optional()
        .default([]),
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
        BillingMode,
        indexes,
      },
    }) => {
      const attrDefs = [
        {
          AttributeName: HashAttrName,
          AttributeType: HashAttrType,
        },
      ];

      function addAttrDef(
        name: string | undefined,
        type: "S" | "N" | "B" | undefined,
      ) {
        if (name && type) {
          attrDefs.push({
            AttributeName: name,
            AttributeType: type,
          });
        }
      }
      const keySchema: KeySchemaElement[] = [
        {
          AttributeName: HashAttrName,
          KeyType: "HASH",
        },
      ];

      addAttrDef(RangeAttrName, RangeAttrType);

      indexes.forEach((index) => {
        if (index.type === "LSI") {
          addAttrDef(index.RangeAttrName, index.RangeAttrType);
        } else if (index.type === "GSI") {
          addAttrDef(index.HashAttrName, index.HashAttrType);
          addAttrDef(index.RangeAttrName, index.RangeAttrType);
        }
      });

      if (RangeAttrName && RangeAttrType) {
        keySchema.push({
          AttributeName: RangeAttrName,
          KeyType: "RANGE",
        });
      }

      const GlobalSecondaryIndexes: CreateTableCommandInput["GlobalSecondaryIndexes"] =
        indexes
          .filter((index) => index.type === "GSI")
          .map((index) => ({
            IndexName: index.name,
            KeySchema: [
              {
                AttributeName: index.HashAttrName,
                KeyType: "HASH",
              },
              {
                AttributeName: index.RangeAttrName,
                KeyType: "RANGE",
              },
            ],
            Projection: {
              ProjectionType: "ALL",
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: index.ReadCapacityUnits,
              WriteCapacityUnits: index.WriteCapacityUnits,
            },
          }));
      await getClient().send(
        new CreateTableCommand({
          TableName,
          AttributeDefinitions: attrDefs,
          KeySchema: keySchema,
          ProvisionedThroughput:
            BillingMode === "PROVISIONED"
              ? {
                  ReadCapacityUnits,
                  WriteCapacityUnits,
                }
              : undefined,
          BillingMode: BillingMode,
          GlobalSecondaryIndexes:
            GlobalSecondaryIndexes.length > 0
              ? GlobalSecondaryIndexes
              : undefined,
          LocalSecondaryIndexes: indexes
            .filter((index) => index.type === "LSI")
            .map((index) => ({
              IndexName: index.name,
              KeySchema: [
                {
                  // AttributeName: index.HashAttrName,
                  AttributeName: HashAttrName,
                  KeyType: "HASH",
                },
                {
                  AttributeName: index.RangeAttrName,
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            })),
        }),
      );
    },
  );
