"use client";

import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { moveCard } from "@/app/(app)/cards/actions";
import { MoveSheet } from "@/components/move-sheet";
import { useToast } from "@/components/shell/toaster";
import { fmtMoney } from "@/lib/format";
import { T } from "@/lib/texts";
import type { Stage } from "@/lib/types";

export type BoardCard = { id: string; stage_id: string; position: number; value_cents: number | null; body: ReactNode };

/** One Kanban for every pipeline: columns on desktop (drag and drop), a stage switch + list on the phone. */
export function Kanban({ stages, cards: initial, sales }: { stages: Stage[]; cards: BoardCard[]; sales: boolean }) {
  const [cards, setCards] = useState(initial);
  const [current, setCurrent] = useState(stages[0]?.id);
  const [pendingMove, setPendingMove] = useState<{ cardId: string; from: string; to: string; position: number } | null>(null);
  const [, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Keep in sync when the server sends fresh data (router.refresh after a move).
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) {
    setSeen(initial);
    setCards(initial);
  }

  const inStage = (sid: string) => cards.filter((c) => c.stage_id === sid).sort((a, b) => a.position - b.position);

  const apply = (cardId: string, to: string, position: number) =>
    setCards((list) => {
      const moving = list.find((c) => c.id === cardId)!;
      const rest = list.filter((c) => c.id !== cardId);
      const target = rest.filter((c) => c.stage_id === to).sort((a, b) => a.position - b.position);
      target.splice(position - 1, 0, { ...moving, stage_id: to });
      const renum = new Map(target.map((c, i) => [c.id, i + 1]));
      return [...rest.filter((c) => c.stage_id !== to), ...target].map((c) => (renum.has(c.id) ? { ...c, stage_id: to, position: renum.get(c.id)! } : c));
    });

  const onDragEnd = (e: DragEndEvent) => {
    const cardId = String(e.active.id);
    const over = e.over?.id ? String(e.over.id) : null;
    if (!over) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    let to: string;
    let position: number;
    if (over.startsWith("stage:")) {
      to = over.slice(6);
      position = inStage(to).filter((c) => c.id !== cardId).length + 1;
    } else {
      const target = cards.find((c) => c.id === over);
      if (!target || target.id === cardId) return;
      to = target.stage_id;
      position = inStage(to).filter((c) => c.id !== cardId).findIndex((c) => c.id === target.id) + 1;
    }
    const stage = stages.find((s) => s.id === to)!;
    if (to !== card.stage_id && (stage.requires_note || stage.requires_reschedule)) {
      setPendingMove({ cardId, from: card.stage_id, to, position });
      return;
    }
    if (to === card.stage_id && position === card.position) return;
    const before = cards;
    apply(cardId, to, position);
    start(async () => {
      const res = await moveCard({ cardId, stageId: to, position });
      if (!res.ok) {
        setCards(before);
        toast(res.error);
      } else {
        if (to !== card.stage_id) toast(`${T.toast.moved} ${stage.name}`);
        router.refresh();
      }
    });
  };

  return (
    <>
      <div className="stage-switch">
        <div className="segmented" role="tablist">
          {stages.map((s) => (
            <button key={s.id} type="button" role="tab" className={clsx(s.id === current && "is-active")} aria-selected={s.id === current} onClick={() => setCurrent(s.id)}>
              <span className={clsx("dot", s.tone)} />
              {s.name}
              <span className="n">{inStage(s.id).length}</span>
            </button>
          ))}
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="kanban">
          {stages.map((s) => {
            const items = inStage(s.id);
            const total = items.reduce((x, c) => x + (c.value_cents ?? 0), 0);
            return (
              <Column key={s.id} stage={s} hidden={s.id !== current}>
                <div className="stage-head">
                  <span className={clsx("dot", s.tone)} />
                  {s.name}
                  <span className="n num">
                    {items.length}
                    {sales && total ? ` · ${fmtMoney(total)}` : ""}
                  </span>
                </div>
                <DropBody id={s.id}>
                  {items.length ? (
                    items.map((c) => <Item key={c.id} card={c} />)
                  ) : (
                    <div className="empty" style={{ padding: "24px 12px" }}>
                      <p style={{ margin: 0 }}>{T.empty.stage}</p>
                    </div>
                  )}
                </DropBody>
              </Column>
            );
          })}
        </div>
      </DndContext>
      {pendingMove ? (
        <MoveSheet
          cardId={pendingMove.cardId}
          current={pendingMove.from}
          stages={stages}
          initial={pendingMove.to}
          position={pendingMove.position}
          onClose={() => setPendingMove(null)}
        />
      ) : null}
    </>
  );
}

function Column({ stage, hidden, children }: { stage: Stage; hidden: boolean; children: ReactNode }) {
  return (
    <section className={clsx("stage-col", hidden && "is-hidden")} aria-label={stage.name}>
      {children}
    </section>
  );
}

function DropBody({ id, children }: { id: string; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage:${id}` });
  return (
    <div ref={setNodeRef} className={clsx("stage-body", isOver && "is-over")}>
      {children}
    </div>
  );
}

function Item({ card }: { card: BoardCard }) {
  const drag = useDraggable({ id: card.id });
  const drop = useDroppable({ id: card.id });
  const style = drag.transform ? { transform: `translate3d(${drag.transform.x}px, ${drag.transform.y}px, 0)`, zIndex: 10, position: "relative" as const } : undefined;
  return (
    <Link
      ref={(el) => {
        drag.setNodeRef(el);
        drop.setNodeRef(el);
      }}
      href={`/cards/${card.id}`}
      className={clsx("card-item", drag.isDragging && "is-dragging")}
      style={style}
      {...drag.listeners}
      {...drag.attributes}
      role="link"
      onClick={(e) => drag.isDragging && e.preventDefault()}
    >
      {card.body}
    </Link>
  );
}
