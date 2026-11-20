// Zod with Portuguese messages (#15): import { z } from "@/lib/zod" in server actions.
import { z } from "zod";

z.config(z.locales.pt());

export { z };
