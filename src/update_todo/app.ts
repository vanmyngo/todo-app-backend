import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { DEFAULT_USER_ID } from "shared";

const client = new DynamoDB({ region: process.env.REGION });
const docClient = DynamoDBDocument.from(client);

/**
 * Updates a todo item in the DynamoDB table.
 * @param userId - The ID of the user.
 * @param taskId - The ID of the task.
 * @param updates - The fields to update (task and/or completed).
 */
async function updateTodo(
  userId: string, 
  taskId: string, 
  updates: { task?: string; completed?: boolean })
{
  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, unknown> = {};

  // Add the task to the update expression if it is provided
  if (updates.task) {
    updateExpressions.push("task = :task");
    expressionAttributeValues[":task"] = updates.task;
  }

  // Add the completed status to the update expression if it is provided
  if (updates.completed !== undefined) {
    updateExpressions.push("completed = :completed");
    expressionAttributeValues[":completed"] = updates.completed;
  }

  // Call update on the DynamoDB document client with the constructed parameters
  const params: UpdateCommandInput = {
    TableName: process.env.TABLE,
    Key: {
      userId,
      taskId
    },
    UpdateExpression: "SET " + updateExpressions.join(", "),
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW",
  };
  return await docClient.update(params);
};

export const lambda_handler = async (event: APIGatewayProxyEvent) => {
  // Validate taskId
  const taskId = event.pathParameters?.taskId;
  const hasValidTaskId = typeof taskId === "string" && taskId.trim() !== "";
  if (!hasValidTaskId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Task ID is required." })
    };
  }

  // Validate task and completed
  const body = event.body ? JSON.parse(event.body) : {};
  const task = body.task;
  const completed = body.completed;
  const hasValidTask = typeof task === "string" && task.trim() !== "";
  const hasValidCompleted = typeof completed === "boolean";
  if (!hasValidTask && !hasValidCompleted) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Task or completion status is required." })
    };
  }

  // Call the updateTodo function and handle errors
  try {
    const result = await updateTodo(DEFAULT_USER_ID, taskId, {
      ...(hasValidTask && { task }),
      ...(hasValidCompleted && { completed }),
    });
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.error("[update_todo/app.ts] " + error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to update todo." })
    };
  }
};