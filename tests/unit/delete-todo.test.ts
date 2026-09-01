// Fake delete function to control
const mockDelete = jest.fn();

// Mock DynamoDB with fake db
jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocument: {
        from: () => ({ delete: mockDelete })
    }
}));

// Imports
import { lambda_handler } from "../../src/delete_todo/app";
import { DEFAULT_USER_ID } from "shared";

describe("delete_todo", () => {
    it("Returns 204 - todo deleted successfully", async () => {
        // Mock delete success
        mockDelete.mockResolvedValueOnce({});

        // Fake API Gateway event
        const taskId = "task123"
        const event = { pathParameters: { taskId: taskId } };

        // Call handler
        const result = await lambda_handler(event as any);

        // Assert delete successfull
        expect(result.statusCode).toBe(204);
        expect(mockDelete).toHaveBeenCalledWith({
            TableName: process.env.TABLE,
            Key: {
                userId: DEFAULT_USER_ID,
                taskId
            }
        });
    });

    it.each([
        { description: "taskId is missing", body: {} },
        { description: "taskId is empty", body: { taskId: "" } },
        { description: "taskId is whitespace only", body: { taskId: " " } },
        { description: "taskId is not a string", body: { taskId: 123 } },
    ])("Returns 400 - $description", async ({ body }: { body: Record<string, unknown> }) => {
        // Fake API Gateway event
        const event = { body: JSON.stringify(body) };

        // Call handler
        const result = await lambda_handler(event as any);

        // Assert fail before delete is call
        expect(result.statusCode).toBe(400);
        expect(mockDelete).not.toHaveBeenCalled();
    });

    it("Returns 500 - error thrown ", async () => {
        // Query incorrect todo
        mockDelete.mockRejectedValueOnce(new Error("DynamoDB unavailable"));

        // Call handler
        const event = { pathParameters: { taskId: "task123" } };
        const result = await lambda_handler(event as any);

        // Assert response
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body as string).message).toBe("Failed to delete todo."); 
    })
});