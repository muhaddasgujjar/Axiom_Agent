import { useEffect } from 'react';
import { faqItems } from '@/lib/faq';

export const SITE_TITLE =
  'Axiom | Autonomous AI Deep Research Agent with Verified, Citation-Backed Evidence';
export const SITE_DESCRIPTION =
  'Axiom is an enterprise AI deep research agent that autonomously scrapes web sources, builds neural vector indexes, and generates verified, citation-backed research reports for market intelligence, competitive analysis, and decision-making.';

type SeoHeadProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: string;
};

export function siteUrl(path = '/') {
  const configured = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  const base = (configured || (typeof window !== 'undefined' ? window.location.origin : ''))?.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id: string, data: object) {
  document.getElementById(id)?.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export default function SeoHead({
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  path = '/',
  image = '/og-image.svg',
  type = 'website',
}: SeoHeadProps) {
  useEffect(() => {
    document.title = title;
    upsertMeta('name', 'description', description);

    const canonical = siteUrl(path);
    upsertLink('canonical', canonical);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', siteUrl(image));
    upsertMeta('property', 'og:site_name', 'Axiom');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', siteUrl(image));

    upsertJsonLd('json-ld-software-application', {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Axiom',
      applicationCategory: 'Research/BusinessApplication',
      operatingSystem: 'Web',
      description,
      url: siteUrl('/'),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });

    upsertJsonLd('json-ld-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    });
  }, [title, description, path, image, type]);

  return null;
}
