import { putItemAPI } from "@/app/lib/actions/item/create";
import { createTableAPI } from "@/app/lib/actions/tables/create";
import { getClient } from "@/app/lib/utils/dynamodb/clientUtils";
import { faker } from "@faker-js/faker";
import { ulid } from "ulid";

const numberUser = 2;
const tableName = "instagram";

function randomNumber(max: number) {
  return faker.number.int({ min: 0, max });
}

async function createSample() {
  const client = getClient();

  // Create table
  // await createTableAPI({
  //   TableName: tableName,
  //   HashAttrName: "PK",
  //   HashAttrType: "S",
  //   RangeAttrName: "SK",
  //   RangeAttrType: "S",
  //   BillingMode: "PAY_PER_REQUEST",
  //   indexes: [
  //     {
  //       name: "GSI1",
  //       type: "GSI",
  //       HashAttrName: "GSI1PK",
  //       HashAttrType: "S",
  //       RangeAttrName: "GSI1SK",
  //       RangeAttrType: "S",
  //     },
  //   ],
  // });

  // Create sample users
  const usernames: string[] = [];
  for (let i = 0; i < numberUser; i++) {
    const username = faker.internet.username();
    await putItemAPI({
      TableName: tableName,
      Item: {
        PK: `USER#${username}`,
        SK: `USER#${username}`,
        name: faker.person.fullName(),
        followerCount: randomNumber(100),
        followingCount: randomNumber(100),
      },
    });
    usernames.push(username);
  }

  function randomUsername() {
    return usernames[randomNumber(usernames.length - 1)];
  }

  // Create sample photos
  const photoIds: string[] = [];
  for (let j = 0; j < randomNumber(10); j++) {
    const photoId = ulid();
    // Randomly select a user
    const username = randomUsername();

    const likesCount = randomNumber(5);
    await putItemAPI({
      TableName: tableName,
      Item: {
        PK: `UP#${username}`,
        SK: `PHOTO#${photoId}`,
        username,
        url: faker.image.urlPicsumPhotos(),
        likesCount,
        commentCount: randomNumber(100),
      },
    });
    photoIds.push(photoId);

    // Create like
    for (let k = 0; k < likesCount; k++) {
      const likeId = ulid();
      const likingUsername = randomUsername();
      await putItemAPI({
        TableName: tableName,
        Item: {
          PK: `PL#${photoId}`,
          SK: `LIKE#${likingUsername}`,
          GSI1PK: `PL#${photoId}`,
          GSI1SK: `LIKE#${likeId}`,
          likingUsername,
          photoId,
          likeId,
        },
      });
    }
  }

  // Create sample follower
  for (let i = 0; i < randomNumber(10); i++) {
    const followedUsername = randomUsername();
    const followingUsername = randomUsername();
    const pk = `FOLLOW#${followedUsername}`;
    const sk = `FOLLOW#${followingUsername}`;
    await putItemAPI({
      TableName: tableName,
      Item: {
        PK: pk,
        SK: sk,
        GSI1PK: sk,
        GSI1SK: pk,
        followedUsername,
        followingUsername,
      },
    });
  }

  // Create sample comment
  for (let i = 0; i < randomNumber(10); i++) {
    const photoId = photoIds[randomNumber(photoIds.length - 1)];
    const commentingUsername = randomUsername();
    const commentId = ulid();
    await putItemAPI({
      TableName: tableName,
      Item: {
        PK: `PC#${photoId}`,
        SK: `COMMENT#${commentId}`,
        commentingUsername,
        commentId,
        photoId,
        content: faker.lorem.sentence(),
      },
    });
  }
}

createSample();
