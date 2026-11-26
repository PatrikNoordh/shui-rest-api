/**
 * Data access for the comments table. The only code that reads or writes comments.
 */
import { BatchWriteCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { db, TABLES } from './client.mjs';

/**
 * Saves a new comment.
 * @param {{ id: string, postId: string, username: string, content: string, createdAt: string }} comment
 */
export const createComment = async (comment) => {
  await db.send(
    new PutCommand({
      TableName: TABLES.comments,
      Item: comment,
    }),
  );
};

/**
 * Reads all comments of one post, in no particular time order.
 * Follows LastEvaluatedKey, because one Query returns at most 1 MB.
 * @param {string} postId
 * @returns {Promise<object[]>} the comments, or [] if there are none
 */
export const getCommentsByPostId = async (postId) => {
  const comments = [];
  let lastKey;

  do {
    const { Items, LastEvaluatedKey } = await db.send(
      new QueryCommand({
        TableName: TABLES.comments,
        KeyConditionExpression: '#postId = :postId',
        ExpressionAttributeNames: { '#postId': 'postId' },
        ExpressionAttributeValues: { ':postId': postId },
        ExclusiveStartKey: lastKey,
      }),
    );

    comments.push(...(Items ?? []));
    lastKey = LastEvaluatedKey;
  } while (lastKey);

  return comments;
};

/**
 * Deletes all comments of one post.
 * BatchWriteCommand takes at most 25 requests, so the comments are deleted in groups of 25,
 * and anything DynamoDB returns in UnprocessedItems is sent again.
 * @param {string} postId
 */
export const deleteCommentsByPostId = async (postId) => {
  const comments = await getCommentsByPostId(postId);

  for (let i = 0; i < comments.length; i += 25) {
    let requests = comments.slice(i, i + 25).map((comment) => ({
      DeleteRequest: { Key: { postId: comment.postId, id: comment.id } },
    }));

    while (requests.length > 0) {
      const { UnprocessedItems } = await db.send(
        new BatchWriteCommand({
          RequestItems: { [TABLES.comments]: requests },
        }),
      );
      requests = UnprocessedItems?.[TABLES.comments] ?? [];
    }
  }
};
