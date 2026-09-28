import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/ui/brand";
import { LanguageSelect } from "@/components/ui/language-select";

/** Split layout for sign-in, invite and link-recovery screens: brand panel left, form column right. */
export async function AuthShell({ children }: { children: ReactNode }) {
  const t = await getTranslations();
  return (
    <div className="auth">
      <section className="auth-art">
        <Brand href="/library" />
        <div>
          <h2>{t("inv_art_title")}</h2>
          <p>{t("inv_art_p")}</p>
        </div>
      </section>
      <section className="auth-side">
        <div className="auth-card">
          <div className="auth-top">
            <span />
            <LanguageSelect />
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
