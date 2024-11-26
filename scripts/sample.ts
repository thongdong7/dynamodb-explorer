import { getClient } from "@/app/lib/utils/dynamodb/clientUtils";
import {
  BatchWriteItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { chunk } from "lodash";
import { ulid } from "ulid";

async function createSample() {
  const client = getClient();

  // for (let i = 0; i < 2000; i++) {
  //   const command = new PutItemCommand({
  //     TableName: "AppTest",
  //     Item: {
  //       pk: { S: `User#${i}` },
  //       sk: { S: `User#${i}` },
  //       GSI1PK: { S: `User#${i}@gmail.com` },
  //       GSI1SK: { S: `User#${i}@gmail.com` },
  //       name: { S: `User ${i}` },
  //       image: { S: `https://randomuser.me/api/portraits/m/${i}` },
  //     },
  //   });
  //   await client.send(command);

  //   // Create sample posts
  //   for (let j = 0; j < 10; j++) {
  //     const postId = ulid();
  //     await client.send(
  //       new PutItemCommand({
  //         TableName: "AppTest",
  //         Item: {
  //           pk: { S: `User#${i}` },
  //           sk: { S: `Post#${postId}` },
  //           GSI1PK: { S: `Post#${postId}` },
  //           GSI1SK: { S: `Post#${postId}` },
  //           id: { S: postId },
  //           title: { S: `Post ${j}` },
  //           content: { S: `Post content ${j}` },
  //         },
  //       }),
  //     );
  //   }
  // }

  const chunkSize = 25;
  // Create users
  // for (let i = 0; i < 2000 / chunkSize; i++) {
  //   await client.send(
  //     new BatchWriteItemCommand({
  //       RequestItems: {
  //         AppTest: Array.from({ length: chunkSize }, (_, j) => {
  //           return {
  //             PutRequest: {
  //               Item: {
  //                 pk: { S: `User#${i * chunkSize + j}` },
  //                 sk: { S: `User#${i * chunkSize + j}` },
  //                 GSI1PK: { S: `User#${i}@gmail.com` },
  //                 GSI1SK: { S: `User#${i}@gmail.com` },
  //                 name: { S: `User ${i * chunkSize + j}` },
  //                 image: {
  //                   S: `https://randomuser.me/api/portraits/m/${i * chunkSize + j}`,
  //                 },
  //               },
  //             },
  //           };
  //         }),
  //       },
  //     }),
  //   );
  // }

  // Create sample posts
  let posts: {
    PutRequest: {
      Item: Record<string, { S: string }>;
    };
  }[] = [];
  for (let i = 0; i < 2000 / chunkSize; i++) {
    posts = posts.concat(
      Array.from({ length: chunkSize * 10 }, (_, j) => {
        const postId = ulid();
        return {
          PutRequest: {
            Item: {
              pk: { S: `User#${i * chunkSize + j}` },
              sk: { S: `Post#${postId}` },
              GSI1PK: { S: `Post#${postId}` },
              GSI1SK: { S: `Post#${postId}` },
              id: { S: postId },
              title: { S: `Post ${j}` },
              content: { S: `Post content ${j}` },
            },
          },
        };
      }),
    );
  }

  const postsChunks = chunk(posts, chunkSize);
  for (const postsChunk of postsChunks) {
    await client.send(
      new BatchWriteItemCommand({
        RequestItems: {
          AppTest: postsChunk,
        },
      }),
    );
  }
}

createSample();
