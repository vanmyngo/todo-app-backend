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

/**
 * Define CORS headers
 */
export const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
}