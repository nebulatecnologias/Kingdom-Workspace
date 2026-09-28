import { describe, expect, it } from "vitest";
import { gatewayEvent, isOrderEvent, parseOrderData } from "@/lib/gateway/events";
import { parseSignatureHeader, signPayload, signatureHeader, verifySignature } from "@/lib/gateway/signature";
import { renderUnlockedEmail } from "@/lib/email/templates";

const body = JSON.stringify({ id: "evt_1", type: "order.paid" });
const now = 1_790_000_000;

describe("gateway signature", () => {
  it("accepts a valid signature", () => {
    const header = signatureHeader(["whsec_a"], body, now);
    expect(verifySignature({ header, body, secrets: ["whsec_a"], now })).toEqual({ ok: true });
  });

  it("matches the contract: HMAC-SHA256 of '<t>.<body>' in hex", () => {
    // Reference value from: printf '1.{}' | openssl dgst -sha256 -hmac secret
    expect(signPayload("secret", 1, "{}")).toBe("1122767b193110cfec322b6f199b599edbf608ed087f2d27afb0b97d99523908");
    expect(signatureHeader(["s"], "{}", 5)).toBe(`t=5,v1=${signPayload("s", 5, "{}")}`);
  });

  it("rejects a wrong secret, a changed body and a missing header", () => {
    const header = signatureHeader(["whsec_a"], body, now);
    expect(verifySignature({ header, body, secrets: ["whsec_b"], now })).toEqual({ ok: false, reason: "mismatch" });
    expect(verifySignature({ header, body: body + " ", secrets: ["whsec_a"], now })).toEqual({ ok: false, reason: "mismatch" });
    expect(verifySignature({ header: null, body, secrets: ["whsec_a"], now })).toEqual({ ok: false, reason: "missing" });
    expect(verifySignature({ header: "t=abc,v1=zz", body, secrets: ["whsec_a"], now })).toEqual({ ok: false, reason: "malformed" });
  });

  it("rejects timestamps more than 5 minutes away (replay protection)", () => {
    const old = signatureHeader(["whsec_a"], body, now - 301);
    const future = signatureHeader(["whsec_a"], body, now + 301);
    expect(verifySignature({ header: old, body, secrets: ["whsec_a"], now })).toEqual({ ok: false, reason: "stale" });
    expect(verifySignature({ header: future, body, secrets: ["whsec_a"], now })).toEqual({ ok: false, reason: "stale" });
    expect(verifySignature({ header: signatureHeader(["whsec_a"], body, now - 299), body, secrets: ["whsec_a"], now }).ok).toBe(true);
  });

  it("accepts either secret during a rotation (two v1 values, or the previous secret stored here)", () => {
    const both = signatureHeader(["whsec_old", "whsec_new"], body, now);
    expect(parseSignatureHeader(both)?.signatures).toHaveLength(2);
    expect(verifySignature({ header: both, body, secrets: ["whsec_new"], now }).ok).toBe(true);
    const oldOnly = signatureHeader(["whsec_old"], body, now);
    expect(verifySignature({ header: oldOnly, body, secrets: ["whsec_new", "whsec_old"], now }).ok).toBe(true);
  });

  it("refuses to check without a configured secret", () => {
    expect(verifySignature({ header: signatureHeader(["x"], body, now), body, secrets: [], now })).toEqual({ ok: false, reason: "no_secret" });
  });
});

const paid = {
  id: "evt_01JABCXYZ",
  type: "order.paid",
  api_version: "2026-09-01",
  created_at: "2026-09-23T10:15:00Z",
  livemode: true,
  data: {
    order: { id: "ord_01JABC", reference: "KG-20260923-8F3K2", status: "paid", amount: 14900, currency: "ZAR", refunded_amount: 0 },
    customer: { email: "parent@example.co.za", name: "Thandi Mokoena", phone: null },
    locale: "en",
    items: [{ product_id: "prod_bible_stories_pack_1", sku: "KM-BSP1", name: "Pack", quantity: 1, unit_amount: 14900 }],
    metadata: { member_user_id: null, source: "checkout" },
  },
};

describe("gateway events", () => {
  it("accepts the contract's example payload", () => {
    const event = gatewayEvent.parse(paid);
    expect(isOrderEvent(event.type)).toBe(true);
    const data = parseOrderData("order.paid", event.data);
    expect(data.ok).toBe(true);
  });

  it("treats a missing livemode as live", () => {
    const { livemode, ...rest } = paid;
    void livemode;
    expect(gatewayEvent.parse(rest).livemode).toBe(true);
  });

  it("rejects order data without a valid customer email", () => {
    const data = { ...paid.data, customer: { email: "not-an-email" } };
    expect(parseOrderData("order.paid", data).ok).toBe(false);
  });

  it("requires won or lost on dispute_resolved", () => {
    expect(parseOrderData("order.dispute_resolved", paid.data).ok).toBe(false);
    expect(parseOrderData("order.dispute_resolved", { ...paid.data, outcome: "won" }).ok).toBe(true);
    expect(parseOrderData("order.dispute_resolved", { ...paid.data, outcome: "maybe" }).ok).toBe(false);
  });

  it("does not treat integration.test or unknown types as order events", () => {
    expect(isOrderEvent("integration.test")).toBe(false);
    expect(isOrderEvent("order.shipped")).toBe(false);
  });
});

describe("unlocked email", () => {
  it("lists the products and the order in the member's language", () => {
    const email = renderUnlockedEmail({
      locale: "pt",
      siteUrl: "https://members.example",
      name: "Ana",
      productTitles: ["A Arca de Noé", "Dinheiro à maneira de Deus"],
      orderRef: "KG-1",
      amountCents: 14900,
    });
    expect(email.subject).toBe("Novo na sua biblioteca: A Arca de Noé e Dinheiro à maneira de Deus");
    expect(email.html).toContain("https://members.example/library?lang=pt");
    expect(email.text).toContain("KG-1");
    expect(email.text).toMatch(/149,00/);
  });

  it("escapes product titles", () => {
    const email = renderUnlockedEmail({ locale: "en", siteUrl: "https://m", name: "A", productTitles: ["<b>x</b>"] });
    expect(email.html).not.toContain("<b>x</b>");
  });
});
