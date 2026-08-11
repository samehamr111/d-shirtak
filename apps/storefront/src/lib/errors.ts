import { ApiError } from "./api-client";

/** Pulls the most specific message available out of a caught error instead of
 *  discarding it behind a generic fallback — an ApiError already carries the
 *  API's descriptive message, a network failure gets its own clear wording. */
export function describeError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof TypeError && /fetch/i.test(err.message)) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
