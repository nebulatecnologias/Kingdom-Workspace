import type { Metadata } from "next";
import { Later } from "@/components/later";

export const metadata: Metadata = { title: "Ajuda" };

export default function Page() {
  return (
    <Later
      title="Ajuda"
      subtitle="Guias rápidos para a equipa e para os administradores de condomínio."
      items={["Como resolver uma excepção de reconciliação.", "Como fechar o dia de um canal.", "Como emitir o lote mensal de facturas.", "Como propor um acordo de pagamento."]}
    />
  );
}
