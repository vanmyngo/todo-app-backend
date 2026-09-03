// Mock function for DynamoDBDocument.query
const mockQuery = jest.fn();
jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocument: {
        from: () => ({ query: mockQuery })
    }
}));

// Mock function for getUserIdFromEvent
const mockGetUserIdFromEvent = jest.fn();
jest.mock("shared", () => ({
    getUserIdFromEvent: () => mockGetUserIdFromEvent()
}));

// Imports
import { lambda_handler } from "../../src/list_todos/app";

describe("list_todos", () => {
    beforeEach(() => { 
        mockGetUserIdFromEvent.mockReturnValue(process.env.TEST_USER_ID); 
    });
    
    it.each([ 
        {
            description: "Returns 200 - successful query with todos",
            mockTodos: [{ userId: process.env.TEST_USER_ID, "taskId": "1", task: "Buy bread", completed: false }]
        },
        {
            description: "Returns 200 - no todos",
            mockTodos: []
        }
    ])("$description", async ({ mockTodos }: { mockTodos: Record<string, unknown>[] }) => {        
        // Query mock todo
        mockQuery.mockResolvedValueOnce({ Items: mockTodos });

        // Call real handler
        const event = {};
        const result = await lambda_handler(event as any);

        // Assert response
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(mockTodos);
    });

    it("Returns 500 - error thrown", async () => {
        // Query incorrect todo
        mockQuery.mockRejectedValueOnce(new Error("DynamoDB unavailable"));

        // Call handler
        const event = {};
        const result = await lambda_handler(event as any);

        // Assert response
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).message).toBe("Failed to fetch todos.");    
    });

    it("Queried the correct parameters", async () => {
        // Query empty todo
        mockQuery.mockResolvedValueOnce({ Items: [] });

        // Call handler
        const event = {};
        await lambda_handler(event as any);

        // Assert request parameters
        expect(mockQuery).toHaveBeenCalledWith({
            TableName: process.env.TABLE,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: { ":userId": process.env.TEST_USER_ID }
        });
    });
})