import { z } from "zod";

/** Event types the gateway sends (contract v1, see docs/kingdom-members/prompt-gateway-paystack.md). */
export const ORDER_EVENTS = ["order.paid", "order.refunded", "order.disputed", "order.dispute_resolved"] as const;
export type OrderEventType = (typeof ORDER_EVENTS)[number];

const order = z.looseObject({
  id: z.string().min(1).max(200),
  reference: z.string().max(200).nullish(),
  amount: z.number().int().nonnegative().nullish(),
  currency: z.string().max(10).nullish(),
  refunded_amount: z.number().int().nonnegative().nullish(),
  full_refund: z.boolean().nullish(),
});

const orderData = z.looseObject({
  order,
  customer: z.looseObject({
    email: z.email().max(320),
    name: z.string().max(200).nullish(),
  }),
  locale: z.string().max(10).nullish(),
  items: z.array(z.looseObject({ product_id: z.string().min(1).max(200) })).max(100).default([]),
  metadata: z.looseObject({ member_user_id: z.string().max(100).nullish() }).nullish(),
  outcome: z.enum(["won", "lost"]).nullish(),
  full_refund: z.boolean().nullish(),
  refunded_amount: z.number().int().nonnegative().nullish(),
});

export const gatewayEvent = z.looseObject({
  id: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  api_version: z.string().max(40).nullish(),
  created_at: z.string().max(40).nullish(),
  livemode: z.boolean().default(true),
  data: z.unknown(),
});
export type GatewayEvent = z.infer<typeof gatewayEvent>;

export function isOrderEvent(type: string): type is OrderEventType {
  return (ORDER_EVENTS as readonly string[]).includes(type);
}

/** Validates the data of an order.* event. dispute_resolved must say who won. */
export function parseOrderData(type: OrderEventType, data: unknown) {
  const parsed = orderData.safeParse(data);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  const d = parsed.data;
  if (type === "order.dispute_resolved") {
    const outcome = d.outcome ?? (d as { dispute?: { outcome?: unknown } }).dispute?.outcome;
    if (outcome !== "won" && outcome !== "lost") return { ok: false as const, error: "outcome: expected won or lost" };
  }
  return { ok: true as const, data: d };
}
