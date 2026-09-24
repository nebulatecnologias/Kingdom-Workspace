// Legal documents shown at /legal/terms, /legal/privacy and /legal/refunds.
// They are published in English only; other languages see a short note saying so.
// Company details are those of Shelton Douglas Group (Pty) Ltd until the new company is registered.

/** A paragraph, a bullet list, the contact details, or a paragraph with a link to another legal page. */
export type LegalBlock = string | { list: string[] } | { contact: true } | { before: string; link: { doc: string; label: string }; after: string };

export type LegalDoc = {
  title: string;
  updated: string;
  intro: string[];
  sections: { heading: string; blocks: LegalBlock[] }[];
};

export const COMPANY = {
  name: "Shelton Douglas Group (Pty) Ltd",
  registration: "2025/432920/07",
  address: "2 Mushroom Road, Plooysville AH, Midrand, South Africa",
  email: "contact@sheltondouglas.co.za",
  phone: "+27 78 448 6040",
  whatsapp: "https://wa.me/27784486040",
};

const terms: LegalDoc = {
  title: "Terms of Use",
  updated: "24 September 2026",
  intro: [
    `Welcome to Kingdom Library. Kingdom Library is a brand of ${COMPANY.name} ("we", "our" or "us"). These Terms of Use govern your use of this website and the digital resources available through Kingdom Library. By using this website or purchasing our products, you agree to these Terms. If you do not agree, please do not use our website or products.`,
  ],
  sections: [
    {
      heading: "1. About us",
      blocks: [
        `${COMPANY.name} is a South African company, registration number ${COMPANY.registration}, with its head office at 2 Mushroom Road, Plooysville AH, Midrand. Kingdom Library offers Christian digital resources, including colouring packs, eBooks, guides and workbooks, for individuals, families, Sunday schools, churches and ministries.`,
      ],
    },
    {
      heading: "2. Using this website",
      blocks: [
        "When you use this website or buy our products, you agree:",
        {
          list: [
            "to provide accurate and truthful information;",
            "not to misuse the website, its content or its tools;",
            `to respect all intellectual property belonging to Kingdom Library and ${COMPANY.name}.`,
          ],
        },
      ],
    },
    {
      heading: "3. Your account",
      blocks: [
        "Your account is created from the invite we email you after your purchase. It is personal to you: keep your password and sign-in links to yourself, and let us know straight away if you think someone else has used your account.",
      ],
    },
    {
      heading: "4. Licence to use the materials",
      blocks: [
        "When you buy a product, you may read, download, print and use it as many times as you need for yourself, your family, your Sunday school class, your church or your ministry.",
        "You may not:",
        {
          list: [
            "resell, redistribute or share the files with other people, churches or organisations;",
            "upload the files to websites, shared drives, social media or other platforms;",
            "edit the materials and sell or distribute them as your own.",
          ],
        },
      ],
    },
    {
      heading: "5. Ownership of content",
      blocks: [
        `All materials, including text, illustrations, activities, printable files and templates, are the intellectual property of ${COMPANY.name}. Unauthorised distribution, duplication or resale is strictly prohibited.`,
      ],
    },
    {
      heading: "6. Payment and access",
      blocks: [
        "Payments are processed securely by our payment provider. Once your payment is confirmed, we email you a link to create your account, and the product appears in your library.",
      ],
    },
    {
      heading: "7. Refunds",
      blocks: [
        {
          before: "You may ask for a refund within 7 days of your purchase, by email. The details are in our ",
          link: { doc: "refunds", label: "Refund Policy" },
          after: ". If a purchase is refunded, in full or in part, access to the products in that order is removed from your library.",
        },
      ],
    },
    {
      heading: "8. Limitation of liability",
      blocks: [
        "We provide educational resources and support, but we cannot guarantee specific results, as these depend on how the materials are used. We are not liable for any loss, damage or interruption resulting from the use or misuse of our website or products.",
      ],
    },
    {
      heading: "9. Changes to these Terms",
      blocks: ["We may update these Terms at any time. Please check this page from time to time to stay informed."],
    },
    { heading: "10. Contact", blocks: [{ contact: true }] },
  ],
};

const privacy: LegalDoc = {
  title: "Privacy Policy",
  updated: "23 September 2026",
  intro: [
    `This Privacy Policy explains how ${COMPANY.name} ("we", "our" or "us"), the company behind Kingdom Library, collects and uses your personal information, in line with the Protection of Personal Information Act, 2013 (POPIA). We are the responsible party for the personal information described here.`,
  ],
  sections: [
    {
      heading: "1. What we collect",
      blocks: [
        {
          list: [
            "Account details: your name, email address, preferred language, and the date you accepted our Terms.",
            "Purchases: the products you bought, order references, amounts and refund status, as sent to us by our payment gateway. We never receive or store your card details.",
            "Use of your library: which products you open and how far you have read, so you can pick up where you left off.",
            "Security information: sign-in times, and your IP address for a short time to limit repeated sign-in attempts.",
            "Emails we send you: the type of email, when it was sent and whether it was delivered.",
          ],
        },
      ],
    },
    {
      heading: "2. Why we use it",
      blocks: [
        {
          list: [
            "to create your account and give you access to what you bought;",
            "to send you invites, sign-in links, password resets and notices about your purchases;",
            "to keep your account and our website secure;",
            "to answer your questions and give you support;",
            "to meet our legal and accounting obligations.",
          ],
        },
        "We use your information because it is needed to provide the products you bought, because we have a legitimate interest in keeping the service secure, or because the law requires it. We do not send marketing emails without your consent, and we never sell your information.",
      ],
    },
    {
      heading: "3. Who we share it with",
      blocks: [
        "We share your information only with the service providers that help us run Kingdom Library, and only as far as they need it:",
        {
          list: [
            "our payment gateway and Paystack, which process your payment;",
            "Supabase, which hosts our database and sign-in system;",
            "Vercel, which hosts this website;",
            "Resend, which delivers our emails.",
          ],
        },
        "Some of these providers store information outside South Africa (for example in the United Kingdom, the European Union or the United States). We use providers that protect personal information to a standard comparable to POPIA, as section 72 of the Act requires.",
      ],
    },
    {
      heading: "4. How long we keep it",
      blocks: [
        "We keep your account information for as long as your account is open. Purchase records are kept for as long as tax and accounting law requires. Security records, such as the IP addresses used to limit sign-in attempts, are deleted within a day.",
      ],
    },
    {
      heading: "5. How we protect it",
      blocks: [
        "Your information is encrypted in transit, access is limited to people who need it, and each member can see only their own data. Invite and sign-in links work once and expire, and we store only a scrambled version of them.",
      ],
    },
    {
      heading: "6. Cookies",
      blocks: [
        "We use only the cookies needed to keep you signed in and to remember your language. We do not use advertising or tracking cookies.",
      ],
    },
    {
      heading: "7. Children",
      blocks: [
        "Many of our resources are made for children, but accounts are for adults. A parent, guardian, teacher or ministry leader buys the product and uses it with the children in their care. We do not knowingly collect personal information from children.",
      ],
    },
    {
      heading: "8. Your rights",
      blocks: [
        "You may ask us to confirm what personal information we hold about you, to correct it, or to delete it. You may also object to how we use it. Contact us using the details below and we will respond within a reasonable time.",
        "If you are not satisfied with our response, you may complain to the Information Regulator (South Africa) at inforegulator.org.za.",
      ],
    },
    {
      heading: "9. Changes to this policy",
      blocks: ["We may update this policy from time to time. The date at the top shows when it last changed."],
    },
    { heading: "10. Contact and Information Officer", blocks: [{ contact: true }] },
  ],
};

const refunds: LegalDoc = {
  title: "Refund Policy",
  updated: "24 September 2026",
  intro: [
    `This Refund Policy explains how refunds work for the digital products sold on Kingdom Library, a brand of ${COMPANY.name}. It forms part of our Terms of Use.`,
  ],
  sections: [
    {
      heading: "1. Refunds within 7 days",
      blocks: ["You may ask for a refund within 7 days of your purchase. The 7 days start on the date of your payment."],
    },
    {
      heading: "2. How to ask for a refund",
      blocks: [
        `Send an email to ${COMPANY.email} with:`,
        {
          list: [
            "the email address you used for the purchase;",
            "your order reference, shown on the receipt from our payment provider;",
            "the product or products you would like refunded.",
          ],
        },
        "We will confirm by email once the refund has been processed.",
      ],
    },
    {
      heading: "3. How you are refunded",
      blocks: [
        "Refunds are paid back through our payment provider to the payment method you used. Depending on your bank, the money can take a few working days to appear.",
      ],
    },
    {
      heading: "4. Access after a refund",
      blocks: [
        "Once a purchase is refunded, in full or in part, access to the products in that order is removed from your library. For a kit, this includes every material in the kit.",
      ],
    },
    {
      heading: "5. After 7 days",
      blocks: [
        "After 7 days, purchases are final, except where the law requires otherwise. If a file does not open or seems damaged, contact us at any time and we will help.",
      ],
    },
    {
      heading: "6. Your rights",
      blocks: ["This policy does not limit any rights you have under South African consumer law."],
    },
    { heading: "7. Contact", blocks: [{ contact: true }] },
  ],
};

export const LEGAL_DOCS = { terms, privacy, refunds } as const;
export type LegalSlug = keyof typeof LEGAL_DOCS;
