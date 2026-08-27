import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DEFAULT_USER_ID } from "../shared/constant";

const client = new DynamoDB({ region: process.env.REGION });
const docClient = DynamoDBDocument.from(client);

async function queryItems(userId: string) {
  var params = {
    TableName: process.env.TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": userId }
  };
  const data = await docClient.query(params);
  return data.Items;
}

export const lambda_handler = async () => {
  try {
    const items = await queryItems(DEFAULT_USER_ID)
    return { 
      statusCode: 200,
      body: JSON.stringify(items) 
    };
  } catch (error) {
    console.error("[list_todos/app.ts] Failed with: " + error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch todos."})
    };
  }
};