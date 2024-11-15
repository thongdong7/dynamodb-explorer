// const { doSearch } = require('../util')

import {
  AttributeValue,
  BatchExecuteStatementCommand,
  BatchWriteItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { getClient } from "../../utils/clientUtils";
import { describeTable } from "./describe";
import { chunk } from "lodash";

// const findPrimaryKeys = context => {
//   const params = {
//     TableName: context.tableName
//   }

//   return context.dynamodb.describeTable(params).promise()
//     .then(tableDescription => {
//       const tableSchema = tableDescription.Table.KeySchema

//       context.primaryKeys = ['HASH', 'RANGE']
//         .map(keyType => tableSchema.find(element => element.KeyType === keyType))
//         .filter(attribute => attribute)
//         .map(attribute => attribute.AttributeName)

//       return context
//     })
// }

// const findAllElements = context => {
//   const ExpressionAttributeNames = {}

//   for (const [index, key] of context.primaryKeys.entries()) {
//     ExpressionAttributeNames[`#KEY${index}`] = key
//   }

//   const scanParams = {
//     ExpressionAttributeNames,
//     ProjectionExpression: Object.keys(ExpressionAttributeNames).join(', '),
//   }

//   return doSearch(context.dynamodb, context.tableName, scanParams)
//     .then(items => {
//       context.items = items
//       return context
//     })
// }

// const deleteAllElements = context => {
//   const deleteRequests = []
//   let counter = 0
//   const MAX_OPERATIONS = 25
//   const params = {
//     RequestItems: {
//       [context.tableName]: []
//     }
//   }

//   for (const item of context.items) {
//     params.RequestItems[context.tableName].push({
//       DeleteRequest: {
//         Key: item
//       }
//     })

//     counter++

//     if (counter % MAX_OPERATIONS === 0) {
//       deleteRequests.push(context.dynamodb.batchWriteItem(params).promise())
//       params.RequestItems[context.tableName] = []
//     }
//   }

//   if (counter % MAX_OPERATIONS !== 0) {
//     deleteRequests.push(context.dynamodb.batchWriteItem(params).promise())
//     params.RequestItems[context.tableName] = []
//   }

//   return Promise.all(deleteRequests)
// }

// /**
//  * This function deletes all record from a given table within dynamodb.
//  *
//  * It functions as follows:
//  *  1) Determine the primary key of the table by calling describeTable
//  *  2) Scan all records and store them in an array
//  *  3) Pass the records to #deleteAllElements which in turn sends a delete request for each
//  *  of them
//  *  4) Return a list of promises using Promise.all() to the caller
//  *
//  * @param tableName the table we want to purge
//  * @param dynamodb the AWS dynamodb service that holds the connection
//  * @returns {Promise<any[] | never>} concatenation of all delete request promises
//  */
// const purgeTable = (tableName, dynamodb) => {
//   const context = {
//     tableName,
//     dynamodb
//   }

//   return findPrimaryKeys(context)
//     .then(findAllElements)
//     .then(deleteAllElements)
// }

// module.exports = { purgeTable }

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
      const chunkSize = 25;

      const commands = chunk(result.Items, chunkSize).map((items) => {
        const command = new BatchWriteItemCommand({
          RequestItems: {
            [tableName]: items.map((item) => ({
              DeleteRequest: {
                Key: item,
              },
            })),
          },
        });
        return client.send(command);
      });

      for (const command of commands) {
        await command;
      }

      //   const chunkCommands = chunk(commands, 1);
      //   for (const chunkCommand of chunkCommands) {
      //     await Promise.all(chunkCommand);
      //   }

      // Create a batch write command
      //   const command = new BatchWriteItemCommand({
      //     RequestItems: {
      //       [tableName]: result.Items.map((item) => ({
      //         DeleteRequest: {
      //           Key: item,
      //         },
      //       })),
      //     },
      //   });

      //   // Execute the command
      //   await client.send(command);
    }

    if (result.LastEvaluatedKey) {
      startKey = result.LastEvaluatedKey;
    } else {
      break;
    }
  }
};
