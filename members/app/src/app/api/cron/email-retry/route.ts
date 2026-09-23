import { isCronRequest } from "@/lib/cron";
import { retryFailedEmails } from "@/lib/email/retry";

export const maxDuration = 60;

/** Sends again the emails that failed and are due. Also runs after each gateway webhook. */
export async function GET(request: Request) {
  if (!isCronRequest(request)) return Response.json({ error: "unauthorised" }, { status: 401 });
  return Response.json(await retryFailedEmails(50));
}
