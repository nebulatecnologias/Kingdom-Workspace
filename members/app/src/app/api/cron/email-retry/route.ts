import { isCronRequest } from "@/lib/cron";
import { dailyHealthCheck } from "@/lib/alerts";
import { retryFailedEmails } from "@/lib/email/retry";

export const maxDuration = 60;

/**
 * Daily maintenance: sends again the emails that failed and are due (this also runs after each gateway
 * webhook), then emails the admins a summary if anything went wrong in the last 24 hours.
 */
export async function GET(request: Request) {
  if (!isCronRequest(request)) return Response.json({ error: "unauthorised" }, { status: 401 });
  const retried = await retryFailedEmails(50);
  const health = await dailyHealthCheck();
  return Response.json({ ...retried, alerted: health.alerted });
}
