import { APIGatewayProxyEvent } from "aws-lambda";

/**
 * Extracts the user ID from the API Gateway event object.
 * @param event - The API Gateway event object.
 * @returns The user ID.
 */
export function getUserIdFromEvent(event: APIGatewayProxyEvent): string {
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
        throw new Error("User ID not found in the event.");
    }
    return userId;
};