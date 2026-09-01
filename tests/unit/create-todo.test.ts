// Fake put function to control
const mockPut = jest.fn();

// Mock DynamoDB with fake db
jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocument: {
        from: () => ({ put: mockPut })
    }
}));

// Imports
import { lambda_handler } from "../../src/create_todo/app";
import { DEFAULT_USER_ID } from "shared";

describe("create_todo", () => {
    it("Returns 201 - new item successfully created", async () => {
        // Put todo succeeds
        mockPut.mockResolvedValueOnce({});

        // Fake API Gateway event
        const taskName = "Buy bread";
        const event = { body: JSON.stringify({ task: taskName }) } as any;

        // Call real handler
        const result = await lambda_handler(event);
        const body = JSON.parse(result.body);

        // Assert response shape and status
        expect(result.statusCode).toBe(201);
        expect(body.task).toBe(taskName);
        expect(body.completed).toBe(false);
        expect(body.userId).toBe(DEFAULT_USER_ID);

        // Assert auto-generated values
        expect(typeof body.taskId).toBe("string");
        expect(body.taskId.length).toBeGreaterThan(0);
        expect(typeof body.createdAt).toBe("string");
    });

    it.each([
        { description: "task is missing", body: {} },
        { description: "task is an empty string", body: { task: "" } },
        { description: "task is whitespace only", body: { task: " " } },
        { description: "task is not a string", body: { task: 123 } },
    ])("Returns 400 - $description", async ({ body }: { body: Record<string, unknown> }) => {
        // Fake API Gateway event
        const event = { body: JSON.stringify(body) } as any;

        // Call handler
        const result = await lambda_handler(event);

        // Assert fail before put is call
        expect(result.statusCode).toBe(400);
        expect(mockPut).not.toHaveBeenCalled();
    });

    it("Returns 400 - event.body is missing", async () => {
        // Fake API Gateway event    
        const event = { body: null } as any;

        // Call handler
        const result = await lambda_handler(event);

        // Assert fail before put is call
        expect(result.statusCode).toBe(400);
        expect(mockPut).not.toHaveBeenCalled();
    });
})