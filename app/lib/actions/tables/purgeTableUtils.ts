import { AttributeValue, ScanCommand } from "@aws-sdk/client-dynamodb";
import { batchDeleteItems } from "../../utils/dynamodb/batchUtils";
import { getClient } from "../../utils/dynamodb/clientUtils";
import { describeTable } from "./describe";

export const purgeTable = async (tableName: string) => {
  const table = await describeTable(tableName);
  if (!table) {
    return;
  }

  const primaryKeys = table.KeySchema;

  if (!primaryKeys) {
    return;
  }

  const client = getClient();
  let startKey: Record<string, AttributeValue> | undefined;
  while (true) {
    // Scan the table
    console.log(
      "Scanning table " + tableName + ", startKey: " + JSON.stringify(startKey),
    );
    const result = await client.send(
      new ScanCommand({
        TableName: tableName,
        ProjectionExpression: primaryKeys
          .map((key) => key.AttributeName)
          .join(", "),
        ExclusiveStartKey: startKey,
      }),
    );

    // Delete the items
    if (result.Items && result.Items.length > 0) {
      console.log(`Deleting ${result.Items.length} items`);

      await batchDeleteItems(result.Items, tableName);
    }

    if (result.LastEvaluatedKey) {
      startKey = result.LastEvaluatedKey;
    } else {
      break;
    }
  }
};
