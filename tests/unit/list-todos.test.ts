// Mock vars for lambda handler
process.env.TABLE = "TestTable";
process.env.REGION = "us-east-1";

// Fake query function to control
const mockQuery = jest.fn();

// Mock DynamoDB with fake db
jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocument: {
        from: () => ({ query: mockQuery })
    }
}));

// Imports
import { DEFAULT_USER_ID } from "shared";
import { lambda_handler } from "../../src/list_todos/app";

describe("list_todos", () => {
    it.each([ 
        {
            description: "Returns 200 - successful query with todos",
            mockTodos: [{ userId: "default-user", "taskId": "1", task: "Buy bread", completed: false }]
        },
        {
            description: "Returns 200 - no todos",
            mockTodos: []
        }
    ])("$description", async ({ mockTodos }: { mockTodos: Record<string, unknown>[] }) => {        
        // Query mock todo
        mockQuery.mockResolvedValueOnce({ Items: mockTodos });

        // Call real handler
        const result = await lambda_handler();

        // Assert response
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(mockTodos);
    });

    it("Returns 500 - error thrown", async () => {
        // Query incorrect todo
        mockQuery.mockRejectedValueOnce(new Error("DynamoDB unavailable"));

        // Call handler
        const result = await lambda_handler();

        // Assert response
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).message).toBe("Failed to fetch todos.");    
    });

    it("Queried the correct parameters", async () => {
        // Query empty todo
        mockQuery.mockResolvedValueOnce({ Items: [] });

        // Call handler
        await lambda_handler();

        // Assert request parameters
        expect(mockQuery).toHaveBeenCalledWith({
            TableName: process.env.TABLE,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: { ":userId": DEFAULT_USER_ID}
        });
    });
})