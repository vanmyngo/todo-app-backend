import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { randomUUID } from "crypto";
import { DEFAULT_USER_ID } from "shared";

const client = new DynamoDB({ region: process.env.REGION });
const docClient = DynamoDBDocument.from(client);

/**
 * Creates a new todo item in the DynamoDB table.
 * @param task - The task description.
 */
async function createTodo(task: string) {
  const params = {
    TableName: process.env.TABLE,
    Item: {
      userId: DEFAULT_USER_ID,
      taskId: randomUUID(),
      task,
      completed: false,
      createdAt: new Date().toISOString()
    }
  };
  await docClient.put(params);
  return params.Item;
}

/**
 * Lambda function handler for creating a new todo item.
 * @param event - The Lambda event object.
 */
export const lambda_handler = async (event: APIGatewayProxyEvent) => {
  const body = JSON.parse(event.body ?? "{}");

  if (!body.task || typeof body.task !== "string" || body.task.trim() === "") {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Task is required." })
    };
  }

  try {
    const newTodo = await createTodo(body.task);
    return {
      statusCode: 201,
      body: JSON.stringify(newTodo)
    };
  } catch (error) {
    console.error("[create_todo/app.ts] " + error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create todo." })
    };
  }
};