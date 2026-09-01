// Mock the DynamoDBDocument update method
const mockUpdate = jest.fn();

// Mock the DynamoDBDocument.from method to return an object with the mocked update method
jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocument: {
    from: () => ({ update: mockUpdate })
  }
}));

// Imports
import { lambda_handler } from "../../src/update_todo/app";
import { DEFAULT_USER_ID } from "shared";

describe("update_todo", () => {
    const taskId = "task-1";

    describe("taskId validation", () => {
        it.each([
            { description: "taskId is missing", pathParameters: {} },
            { description: "taskId is empty", pathParameters: { taskId: "" } },
            { description: "taskId is whitespace only", pathParameters: { taskId: "   " } }
        ])("Returns 400 - $description", async ({ pathParameters }: { pathParameters: Record<string, unknown> }) => {
            // Create a mock event with pathParameters and body
            const event = {
                pathParameters: pathParameters,
                body: JSON.stringify({ task: "Buy milk", completed: true })
            } as any;

            // Call the lambda_handler function
            const result = await lambda_handler(event);

            // Assertions
            expect(result.statusCode).toBe(400);
            expect(mockUpdate).not.toHaveBeenCalled();
        });
    });

    describe("body validation", () => {
        it.each([
            { description: "updates only task", body: { task: "Buy milk" }, expected: { ":task": "Buy milk" } },
            { description: "updates only completed to false", body: { completed: false }, expected: { ":completed": false } },
            { description: "updates only completed to true", body: { completed: true }, expected: { ":completed": true } },
            { description: "updates both task and completed", body: { task: "Buy milk", completed: true }, expected: { ":task": "Buy milk", ":completed": true } },
            { description: "updates task to empty string and completed is valid", body: { task: "", completed: true }, expected: { ":completed": true } },
            { description: "updates task to whitespace only and completed is valid", body: { task: "   ", completed: false }, expected: { ":completed": false } },
        ])("Returns 200 - $description", async ({ body, expected }: { body: Record<string, unknown>, expected: Record<string, unknown> }) => {
            // Mock the update method to return a successful response
            mockUpdate.mockResolvedValueOnce({ Attributes: { userId: DEFAULT_USER_ID, taskId, ...expected } });

            // Create a mock event with pathParameters and body
            const event = { pathParameters: { taskId: taskId }, body: JSON.stringify(body) } as any;

            // Call the lambda_handler function
            const result = await lambda_handler(event);

            // Assertions
            expect(result.statusCode).toBe(200);
            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
                TableName: process.env.TABLE,
                Key: { userId: DEFAULT_USER_ID, taskId: taskId },
                UpdateExpression: expect.stringContaining("SET"),
                ExpressionAttributeValues: expected,
                ReturnValues: "ALL_NEW"
            }));
        });

        it.each([
            { description: "event.body is undefined", event: { pathParameters: { taskId } } },
            { description: "event.body is null", event: { pathParameters: { taskId }, body: null } },
        ])("Returns 400 - $description", async ({ event }) => {
            // Call the lambda_handler function
            const result = await lambda_handler(event as any);

            // Assertions
            expect(result.statusCode).toBe(400);
            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it.each([
            { description: "task and completed are both missing", body: {} },
            { description: "task is empty and completed is missing", body: { task: "" } },
            { description: "task is whitespace only and completed is missing", body: { task: "   " } },
            { description: "task is not a string and completed is not boolean", body: { task: 123, completed: "yes" } }
        ])("Returns 400 - $description", async ({ body }: { body: Record<string, unknown> }) => {
            // Create a mock event with pathParameters and body
            const event = { pathParameters: { taskId: taskId }, body: JSON.stringify(body) } as any;

            // Call the lambda_handler function
            const result = await lambda_handler(event);

            // Assertions
            expect(result.statusCode).toBe(400);
            expect(mockUpdate).not.toHaveBeenCalled();
        });
    });

    it("Returns 500 - error thrown", async () => {
        // Mock the update method to return an error
        mockUpdate.mockRejectedValueOnce(new Error("DynamoDB unavailable"));

        // Create a mock event with pathParameters and body
        const event = {  pathParameters: { taskId: taskId }, body: JSON.stringify({ task: "Buy milk", completed: true }) } as any;

        // Call the lambda_handler function
        const result = await lambda_handler(event);

        // Assertions
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).message).toBe("Failed to update todo.");
    });
});