"use server";

import { describeTable, listTables } from "../utils/data";

// {
//   "AttributeDefinitions": [
//     {
//       "AttributeName": "pk",
//       "AttributeType": "S"
//     },
//     {
//       "AttributeName": "sk",
//       "AttributeType": "S"
//     },
//     {
//       "AttributeName": "GSI1PK",
//       "AttributeType": "S"
//     },
//     {
//       "AttributeName": "GSI1SK",
//       "AttributeType": "S"
//     },
//     {
//       "AttributeName": "GSI2PK",
//       "AttributeType": "S"
//     },
//     {
//       "AttributeName": "GSI2SK",
//       "AttributeType": "S"
//     }
//   ],
//   "TableName": "App",
//   "KeySchema": [
//     {
//       "AttributeName": "pk",
//       "KeyType": "HASH"
//     },
//     {
//       "AttributeName": "sk",
//       "KeyType": "RANGE"
//     }
//   ],
//   "TableStatus": "ACTIVE",
//   "CreationDateTime": "2024-10-29T12:54:33.332Z",
//   "ProvisionedThroughput": {
//     "LastIncreaseDateTime": "1970-01-01T00:00:00.000Z",
//     "LastDecreaseDateTime": "1970-01-01T00:00:00.000Z",
//     "NumberOfDecreasesToday": 0,
//     "ReadCapacityUnits": 0,
//     "WriteCapacityUnits": 0
//   },
//   "TableSizeBytes": 6547,
//   "ItemCount": 11,
//   "TableArn": "arn:aws:dynamodb:ap-southeast-1:000000000000:table/App",
//   "BillingModeSummary": {
//     "BillingMode": "PAY_PER_REQUEST",
//     "LastUpdateToPayPerRequestDateTime": "2024-10-29T12:54:33.332Z"
//   },
//   "GlobalSecondaryIndexes": [
//     {
//       "IndexName": "GSI2",
//       "KeySchema": [
//         {
//           "AttributeName": "GSI2PK",
//           "KeyType": "HASH"
//         },
//         {
//           "AttributeName": "GSI2SK",
//           "KeyType": "RANGE"
//         }
//       ],
//       "Projection": {
//         "ProjectionType": "ALL"
//       },
//       "IndexStatus": "ACTIVE",
//       "ProvisionedThroughput": {
//         "ReadCapacityUnits": 0,
//         "WriteCapacityUnits": 0
//       },
//       "IndexSizeBytes": 436,
//       "ItemCount": 1,
//       "IndexArn": "arn:aws:dynamodb:ddblocal:000000000000:table/App/index/GSI2"
//     },
//     {
//       "IndexName": "GSI1",
//       "KeySchema": [
//         {
//           "AttributeName": "GSI1PK",
//           "KeyType": "HASH"
//         },
//         {
//           "AttributeName": "GSI1SK",
//           "KeyType": "RANGE"
//         }
//       ],
//       "Projection": {
//         "ProjectionType": "ALL"
//       },
//       "IndexStatus": "ACTIVE",
//       "ProvisionedThroughput": {
//         "ReadCapacityUnits": 0,
//         "WriteCapacityUnits": 0
//       },
//       "IndexSizeBytes": 5841,
//       "ItemCount": 9,
//       "IndexArn": "arn:aws:dynamodb:ddblocal:000000000000:table/App/index/GSI1"
//     }
//   ],
//   "Replicas": [],
//   "DeletionProtectionEnabled": false
// },

export const listAllTables = async (
  lastEvaluatedTableName: string | null,
  tableNames: string[],
) => {
  // convert to await
  const data = await listTables({
    ExclusiveStartTableName: lastEvaluatedTableName,
  });
  tableNames = tableNames.concat(data.TableNames);
  if (typeof data.LastEvaluatedTableName !== "undefined") {
    return listAllTables(data.LastEvaluatedTableName, tableNames);
  }

  return Promise.all(
    tableNames.map((TableName) => {
      return describeTable({ TableName }).then((data) => data.Table);
    }),
  );
};
