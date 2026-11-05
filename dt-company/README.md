# DT Company — Business Advisory & Development

Site institucional bilíngue (PT/EN) da DT Company, consultoria em Moçambique com quatro pilares: Compliance e Governança, Tax, Incorporação e Consultoria ESG.

## Stack

- **Next.js 15** (App Router, TypeScript), exportação estática (`output: "export"`)
- CSS autoral em `app/globals.css` (sem frameworks de CSS)
- Fonte: **Google Sans** via Google Fonts
- Deploy: **Vercel**

## Desenvolvimento

```bash
npm install
npm run dev        # http://localhost:3000/pt/
```

## Build e pré-visualização estática

```bash
npm run build      # gera ./out
npm run serve      # serve ./out em http://localhost:8940
```

## Estrutura

- `app/[lang]/` — layout raiz (nav, footer, metadados) e homepage; `lang` ∈ `pt`, `en`
- `app/[lang]/[pillar]/` — páginas dos 4 pilares (slugs localizados por idioma)
- `lib/content.ts` — todo o conteúdo bilíngue tipado (pilares, serviços, UI)
- `components/` — Nav, Footer, DossierCard, Reveal (animação de scroll), ícones SVG autorais
- `public/logo-*.png` — logotipo extraído do original fornecido (branco e navy)

## Conteúdo provisório

Os contactos ainda não existem: o CTA usa `mailto:contacto@dtcompany.example` (ver `CONTACT_HREF` em `lib/content.ts`) e o site assinala "contactos provisórios". Substituir quando houver email/telefone/morada reais.

O cartão "Dossier do cliente" no hero é um exemplo ilustrativo (assinalado no próprio cartão).
