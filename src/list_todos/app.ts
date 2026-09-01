import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DEFAULT_USER_ID } from "shared";

const client = new DynamoDB({ region: process.env.REGION });
const docClient = DynamoDBDocument.from(client);

/**
 * Queries the DynamoDB table for all todo items belonging to a specific user.
 * @param userId - The ID of the user whose todos are being queried.
 */
async function queryItems(userId: string) {
  var params = {
    TableName: process.env.TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": userId }
  };
  const data = await docClient.query(params);
  return data.Items;
}

/**
 * Lambda function handler for listing all todo items for a specific user.
 */
export const lambda_handler = async () => {
  try {
    const items = await queryItems(DEFAULT_USER_ID)
    return { 
      statusCode: 200,
      body: JSON.stringify(items) 
    };
  } catch (error) {
    console.error("[list_todos/app.ts] " + error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch todos."})
    };
  }
};