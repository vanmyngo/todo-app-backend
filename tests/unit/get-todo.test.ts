// Fake get function to control
const mockGet = jest.fn();

// Mock DynamoDB with fake db
jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocument: {
        from: () => ({ get: mockGet })
    }
}));

// Imports
import { lambda_handler } from "../../src/get_todo/app";
import { DEFAULT_USER_ID } from "shared";

describe("get_todo", () => {
    it("Returns 200 - todo exists", async () => {
        const taskId = "task1";
        const mockTodo = {
            userId: DEFAULT_USER_ID,
            taskId,
            task: "Buy cookies",
            completed: false,
        };

        // Get todo succeeds
        mockGet.mockResolvedValueOnce({ Item: mockTodo });

        // Fake API Gateway event
        const event = { pathParameters: { taskId: taskId } };

        // Call handler
        const result = await lambda_handler(event as any);

        // Asert response
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(mockTodo);
        expect(mockGet).toHaveBeenCalledWith({
            TableName: process.env.TABLE,
            Key: {
                userId: DEFAULT_USER_ID,
                taskId,
            },
        });
    });

    it.each([
        { description: "taskId is missing", pathParameters: {} },
        { description: "taskId is an empty string", pathParameters: { taskId: "" } },
        { description: "taskId is whitespace only", pathParameters: { taskId: " " } },
        { description: "taskId is not a string", pathParameters: { taskId: 123 } },
    ])("Returns 400 - $description", async ({ pathParameters }) => {
        // Fake API Gateway event
        const event = { pathParameters };

        // Call handler
        const result = await lambda_handler(event as any);

        // Assert fail before lambda returns
        expect(result.statusCode).toBe(400);
        expect(mockGet).not.toHaveBeenCalled();
    });

    it("Returns 404 - todo not found", async () => {
        // Mock db returns undefined
        mockGet.mockResolvedValueOnce({ Item: undefined });

        // Call handler
        const event = { pathParameters: { taskId: "task1" } };
        const result = await lambda_handler(event as any);

        // Assert todo not found
        expect(result.statusCode).toBe(404);
        expect(JSON.parse(result.body).message).toBe("Todo not found.");
    });

    it("Returns 500 - error thrown", async () => {
        // Mock db reject with param
        mockGet.mockRejectedValueOnce(new Error("DynamoDB unavailable"));

        // Call handler
        const event = { pathParameters: { taskId: "task1" } };
        const result = await lambda_handler(event as any);

        // Assert error thrown
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body as string).message).toBe("Failed to get todo."); 
    });
});