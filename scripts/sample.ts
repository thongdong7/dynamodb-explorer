import { getClient } from "@/app/lib/utils/clientUtils";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ulid } from "ulid";

async function createSample() {
  const client = getClient();

  for (let i = 0; i < 2000; i++) {
    const command = new PutItemCommand({
      TableName: "AppTest",
      Item: {
        pk: { S: `User#${i}` },
        sk: { S: `User#${i}` },
        GSI1PK: { S: `User#${i}@gmail.com` },
        GSI1SK: { S: `User#${i}@gmail.com` },
        name: { S: `User ${i}` },
        image: { S: `https://randomuser.me/api/portraits/m/${i}` },
      },
    });
    await client.send(command);

    // Create sample posts
    for (let j = 0; j < 10; j++) {
      const postId = ulid();
      await client.send(
        new PutItemCommand({
          TableName: "AppTest",
          Item: {
            pk: { S: `User#${i}` },
            sk: { S: `Post#${postId}` },
            GSI1PK: { S: `Post#${postId}` },
            GSI1SK: { S: `Post#${postId}` },
            id: { S: postId },
            title: { S: `Post ${j}` },
            content: { S: `Post content ${j}` },
          },
        }),
      );
    }
  }
}

createSample();
