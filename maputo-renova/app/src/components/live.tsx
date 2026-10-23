"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BOOTHS, EXCEPTION_TOTALS, INCOMING, PAYMENTS, PORTFOLIO, type Booth, type Channel, type Payment } from "@/lib/data";

// Simulação de pagamentos a chegar por M-Pesa / e-Mola durante a demonstração.

type Live = {
  payments: Payment[];
  booths: Booth[];
  exceptions: number;
  exceptionsAmount: number;
  cobrado: number;
  reconciliados: number;
  pagamentosMes: number;
  running: boolean;
  lastArrivalId: string | null;
  setRunning: (v: boolean) => void;
  resolveException: (amount: number) => void;
  closeBooth: (channel: Channel) => void;
};

const LiveContext = createContext<Live | null>(null);

const FIRST_ARRIVAL_MS = 4500;
const ARRIVAL_EVERY_MS = 11000;
const MATCHING_AFTER_MS = 900;
const MATCH_AFTER_MS = 2400;

function clock(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function LiveProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>(PAYMENTS);
  const [booths, setBooths] = useState<Booth[]>(BOOTHS);
  const [exceptions, setExceptions] = useState(EXCEPTION_TOTALS.count);
  const [exceptionsAmount, setExceptionsAmount] = useState(EXCEPTION_TOTALS.amount);
  const [cobrado, setCobrado] = useState(PORTFOLIO.cobrado);
  const [reconciliados, setReconciliados] = useState(PORTFOLIO.reconciliados);
  const [pagamentosMes, setPagamentosMes] = useState(PORTFOLIO.pagamentosMes);
  const [running, setRunning] = useState(true);
  const [lastArrivalId, setLastArrivalId] = useState<string | null>(null);
  const cursor = useRef(0);
  const minute = useRef(43);

  const arrive = useCallback(() => {
    if (cursor.current >= INCOMING.length) return false;
    const next = INCOMING[cursor.current++];
    const id = `live-${cursor.current}`;
    const now = new Date(2026, 9, 23, 10, minute.current++);
    const payment: Payment = { ...next, id, time: clock(now), date: "23/10/2026", status: "recebido" };
    setPayments((list) => [payment, ...list]);
    setLastArrivalId(id);
    setPagamentosMes((n) => n + 1);
    setCobrado((n) => n + next.amount);
    setBooths((list) =>
      list.map((b) => (b.channel === next.channel ? { ...b, hoje: b.hoje + next.amount, count: b.count + 1, note: `Último às ${payment.time}` } : b)),
    );
    window.setTimeout(() => {
      setPayments((list) => list.map((p) => (p.id === id ? { ...p, status: "a-reconciliar" } : p)));
    }, MATCHING_AFTER_MS);
    window.setTimeout(() => {
      const matched = Boolean(next.invoice);
      setPayments((list) => list.map((p) => (p.id === id ? { ...p, status: matched ? "reconciliado" : "por-identificar" } : p)));
      if (matched) setReconciliados((n) => n + 1);
      else {
        setExceptions((n) => n + 1);
        setExceptionsAmount((n) => n + next.amount);
      }
    }, MATCH_AFTER_MS);
    return true;
  }, []);

  useEffect(() => {
    if (!running) return;
    let interval: number | undefined;
    const first = window.setTimeout(() => {
      if (!arrive()) return;
      interval = window.setInterval(() => {
        if (!arrive()) window.clearInterval(interval);
      }, ARRIVAL_EVERY_MS);
    }, FIRST_ARRIVAL_MS);
    return () => {
      window.clearTimeout(first);
      if (interval) window.clearInterval(interval);
    };
  }, [running, arrive]);

  const resolveException = useCallback((amount: number) => {
    setExceptions((n) => Math.max(0, n - 1));
    setExceptionsAmount((n) => Math.max(0, n - amount));
    setReconciliados((n) => n + 1);
  }, []);

  const closeBooth = useCallback((channel: Channel) => {
    setBooths((list) => list.map((b) => (b.channel === channel ? { ...b, open: false, note: `Fechado às ${clock(new Date(2026, 9, 23, 10, minute.current))}` } : b)));
  }, []);

  const value = useMemo<Live>(
    () => ({ payments, booths, exceptions, exceptionsAmount, cobrado, reconciliados, pagamentosMes, running, lastArrivalId, setRunning, resolveException, closeBooth }),
    [payments, booths, exceptions, exceptionsAmount, cobrado, reconciliados, pagamentosMes, running, lastArrivalId, resolveException, closeBooth],
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive() {
  const ctx = useContext(LiveContext);
  if (!ctx) throw new Error("useLive fora do LiveProvider");
  return ctx;
}
