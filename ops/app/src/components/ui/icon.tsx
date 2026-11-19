import {
  ArrowLeft, ArrowRight, Briefcase, Building, Calendar, CalendarClock, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleAlert, Clock, Crown, Ellipsis, FileText, GripVertical, History, House, Inbox, LogOut, MapPin, Megaphone,
  MessageCircle, Pencil, Phone, Plus, Printer, Search, Settings, SquareCheckBig, SquareKanban, Target, Trash2, User,
  Users, Video, Wallet, X, type LucideIcon,
} from "lucide-react";
import clsx from "clsx";

// Names follow the prototype's ICONS map (ops/prototype/src/app.js) so markup ports one-to-one.
const ICONS: Record<string, LucideIcon> = {
  home: House, calendar: Calendar, kanban: SquareKanban, "file-text": FileText, users: Users, user: User, plus: Plus,
  "chevron-right": ChevronRight, "chevron-left": ChevronLeft, "chevron-down": ChevronDown, "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight, "map-pin": MapPin, phone: Phone, video: Video, building: Building, clock: Clock,
  check: Check, x: X, more: Ellipsis, search: Search, settings: Settings, "log-out": LogOut, printer: Printer,
  message: MessageCircle, grip: GripVertical, pencil: Pencil, trash: Trash2, target: Target, briefcase: Briefcase,
  megaphone: Megaphone, "check-square": SquareCheckBig, crown: Crown, alert: CircleAlert, inbox: Inbox,
  history: History, "calendar-clock": CalendarClock, wallet: Wallet,
};

export type IconName = keyof typeof ICONS | string;

export function Icon({ name, size, className }: { name: IconName; size?: "sm" | "xs"; className?: string }) {
  const C = ICONS[name] ?? SquareKanban;
  return <C className={clsx("i", size, className)} aria-hidden="true" strokeWidth={1.8} />;
}
