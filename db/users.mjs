/**
 * Data access for the users table. The only code that reads or writes users.
 */
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { db, TABLES } from './client.mjs';

/**
 * Reads one user by username.
 * @param {string} username
 * @returns the user item, or undefined if there is none
 */
export const getUser = async (username) => {
  const { Item } = await db.send(
    new GetCommand({
      TableName: TABLES.users,
      Key: { username },
    }),
  );
  return Item;
};

/**
 * Saves a new user. Fails if the username is already taken.
 * @param {{ username: string, passwordHash: string, createdAt: string }} user
 */
export const createUser = async (user) => {
  await db.send(
    new PutCommand({
      TableName: TABLES.users,
      Item: user,
      ConditionExpression: 'attribute_not_exists(username)',
    }),
  );
};
