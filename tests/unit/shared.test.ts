// imports
import { getUserIdFromEvent } from "shared";


describe("get_user_id_from_event", () => {
    it("Valid user id", () => {
        const event = { requestContext: { authorizer: { claims: { sub: process.env.TEST_USER_ID } } } } as any;
        const userId = getUserIdFromEvent(event);
        expect(userId).toBe(process.env.TEST_USER_ID);
    });

    it.each([
        { description: "authorizer is missing", event: { requestContext: {} } as any },
        { description: "claims is missing", event: { requestContext: { authorizer: {}  } } as any },
        { description: "sub is missing", event: { requestContext: { authorizer: { claims: {} } } } as any },
        { description: "sub is empty string", event: { requestContext: { authorizer: { claims: { sub: "" } } } } as any },
        { description: "sub is whitespace only", event: { requestContext: { authorizer: { claims: { sub: " " } } } } as any },
        { description: "sub is not a string", event: { requestContext: { authorizer: { claims: { sub: 123 } } } } as any },
        { description: "sub is null", event: { requestContext: { authorizer: { claims: { sub: null } } } } as any }
    ])("Throws error - $description", ({ event }) => {
        expect(() => getUserIdFromEvent(event)).toThrow("User ID not found in the event.");
    });
});