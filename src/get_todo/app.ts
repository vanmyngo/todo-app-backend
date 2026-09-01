import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { DEFAULT_USER_ID } from "shared";

const client = new DynamoDB({ region: process.env.REGION });
const docClient = DynamoDBDocument.from(client);

/**
 * Retrieves a todo item from the DynamoDB table.
 * @param userId - The ID of the user who owns the todo.
 * @param taskId - The ID of the task to retrieve.
 */
async function getTodo(userId: string, taskId: string) {
  const params = {
    TableName: process.env.TABLE,
    Key: { 
      userId,
      taskId,
    },
  };

  const result = await docClient.get(params);
  return result;
};

/**
 * Lambda function handler for retrieving a todo item.
 * @param event - The Lambda event object.
 */
export const lambda_handler = async (event: APIGatewayProxyEvent) => {
  const taskId = event.pathParameters?.taskId;

  if (!taskId || typeof taskId !== "string" || taskId.trim() === "") {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Task is required." }),
    };
  }

  try {
    const result = await getTodo(DEFAULT_USER_ID, taskId);

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Todo not found." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    console.error("[get_todo/app.ts] " + error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get todo." }),
    };
  }
};