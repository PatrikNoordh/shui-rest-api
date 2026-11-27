/**
 * Data access for the posts table. The only code that reads or writes posts.
 */
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { db, TABLES } from './client.mjs';

/**
 * Saves a new post.
 * @param {{ id: string, username: string, isGuest: boolean, title: string, content: string, createdAt: string, updatedAt: string }} post
 */
export const createPost = async (post) => {
  await db.send(
    new PutCommand({
      TableName: TABLES.posts,
      Item: post,
    }),
  );
};

/**
 * Reads one post by id.
 * @param {string} postId
 * @returns the post, or undefined if there is none
 */
export const getPostById = async (postId) => {
  const { Item } = await db.send(
    new GetCommand({
      TableName: TABLES.posts,
      Key: { id: postId },
    }),
  );
  return Item;
};

/**
 * Reads every post in the table, in no particular order.
 * Follows LastEvaluatedKey, because one Scan returns at most 1 MB.
 * @returns {Promise<object[]>} all posts, or [] if there are none
 */
export const getAllPosts = async () => {
  const posts = [];
  let lastKey;

  do {
    const { Items, LastEvaluatedKey } = await db.send(
      new ScanCommand({
        TableName: TABLES.posts,
        ExclusiveStartKey: lastKey,
      }),
    );
    posts.push(...(Items ?? []));
    lastKey = LastEvaluatedKey;
  } while (lastKey);

  return posts;
};

/**
 * Reads all posts by one user, newest first, through the usernameIndex GSI.
 * Follows LastEvaluatedKey, because one Query returns at most 1 MB.
 * @param {string} username
 * @returns {Promise<object[]>} the user's posts, or [] if there are none
 */
export const getPostsByUsername = async (username) => {
  const posts = [];
  let lastKey;

  do {
    const { Items, LastEvaluatedKey } = await db.send(
      new QueryCommand({
        TableName: TABLES.posts,
        IndexName: 'usernameIndex',
        KeyConditionExpression: '#username = :username',
        ExpressionAttributeNames: { '#username': 'username' },
        ExpressionAttributeValues: { ':username': username },
        ScanIndexForward: false,
        ExclusiveStartKey: lastKey,
      }),
    );

    posts.push(...(Items ?? []));
    lastKey = LastEvaluatedKey;
  } while (lastKey);

  return posts;
};

/**
 * Changes title, content and updatedAt of an existing post. Never creates a new one.
 * id, username, isGuest and createdAt are not touched.
 * @param {string} postId
 * @param {{ title: string, content: string, updatedAt: string }} changes
 * @returns the whole post after the update
 */
export const updatePost = async (postId, { title, content, updatedAt }) => {
  const { Attributes } = await db.send(
    new UpdateCommand({
      TableName: TABLES.posts,
      Key: { id: postId },
      UpdateExpression: 'SET #title = :title, #content = :content, #updatedAt = :updatedAt',
      ConditionExpression: 'attribute_exists(id)',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#content': 'content',
        '#updatedAt': 'updatedAt',
      },
      ExpressionAttributeValues: {
        ':title': title,
        ':content': content,
        ':updatedAt': updatedAt,
      },
      ReturnValues: 'ALL_NEW',
    }),
  );
  return Attributes;
};

/**
 * Deletes one post by id. Does nothing if it doesn't exist.
 * @param {string} postId
 */
export const deletePost = async (postId) => {
  await db.send(
    new DeleteCommand({
      TableName: TABLES.posts,
      Key: { id: postId },
    }),
  );
};
