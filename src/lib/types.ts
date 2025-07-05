/**
 * A standard return type for server actions.
 * This provides a consistent way to handle success and error states
 * on the client, including Zod validation errors.
 */
export type ActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; fieldErrors?: { [key: string]: string[] } };