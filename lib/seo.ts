import { SITE } from "./site";
import { Faq, Tool } from "./tools/types";

export const softwareSchema = (tool: Tool) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: tool.name,
  url: `${SITE.url}/tools/${tool.slug}`,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any browser",
  description: tool.summary,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
});

export const faqSchema = (faqs: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
});
