/**
 * Shared DynamoDB client and table names for the data layer.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});

/**
 * Document client: plain JavaScript objects in and out.
 */
export const db = DynamoDBDocumentClient.from(client);

/**
 * Table names, read from the environment variables set in serverless.yml.
 */
export const TABLES = {
  users: process.env.USERS_TABLE,
  posts: process.env.POSTS_TABLE,
  comments: process.env.COMMENTS_TABLE,
};
