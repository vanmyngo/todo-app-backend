import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DEFAULT_USER_ID } from "shared";
import type { APIGatewayProxyEvent } from "aws-lambda";

const client = new DynamoDB({ region: process.env.REGION });
const docClient = DynamoDBDocument.from(client);

/**
 * Deletes a todo item from the DynamoDB table.
 * @param userId - The ID of the user who owns the todo.
 * @param taskId - The ID of the task to delete.
 */
async function deleteTodo(userId: string, taskId: string) {
  const params = {
    TableName: process.env.TABLE,
    Key: {
      userId,
      taskId,
    },
  };

  await docClient.delete(params);
}

/**
 * Lambda function handler for deleting a todo item.
 * @param event - The Lambda event object.
 */
export const lambda_handler = async (event: APIGatewayProxyEvent) => {
  const taskId = event.pathParameters?.taskId;

  // Ensure a valid taskId was provided in the path  
  if (!taskId || typeof taskId !== "string" || taskId.trim() === "") {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Task is required to delete." })
    };
  }

  try {
    await deleteTodo(DEFAULT_USER_ID, taskId);
    return {
      statusCode: 204,
    };
  } catch (error) {
    console.error("[delete_todo/app.ts] " + error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to delete todo." })
    };
  }
};