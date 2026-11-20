import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export const metadata = { title: "Página não encontrada" };

/** #50 The 404 page, in Portuguese, with a way back. */
export default function NotFound() {
  return (
    <main className="page" style={{ maxWidth: 520, margin: "0 auto", paddingTop: "18vh" }}>
      <div className="card card-pad" style={{ textAlign: "center" }}>
        <p className="caption num" style={{ margin: 0 }}>404</p>
        <h1 className="h-display" style={{ margin: "6px 0 8px" }}>Página não encontrada</h1>
        <p className="caption" style={{ margin: "0 0 16px" }}>O endereço pode estar errado, ou o cartão ou a ata já não existe.</p>
        <Link className="btn btn-primary" href="/">
          <Icon name="home" size="sm" />
          Voltar ao Início
        </Link>
      </div>
    </main>
  );
}
