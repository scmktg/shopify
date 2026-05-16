import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/siteUrl';

// User agents of the major LLM training and retrieval bots. Listing
// each explicitly with `allow: '/'` signals to bot operators that we
// welcome them (some sites now block by default; explicit allow is a
// stronger affirmative signal than the catch-all wildcard rule).
//
// Sources:
// - GPTBot, ChatGPT-User, OAI-SearchBot — OpenAI
// - ClaudeBot, Claude-Web, anthropic-ai — Anthropic
// - PerplexityBot, Perplexity-User — Perplexity
// - Google-Extended — Google's Gemini training opt-in
// - CCBot — Common Crawl, used as training corpus by many LLMs
// - Bytespider — ByteDance (Doubao, Coze, etc.)
// - Applebot-Extended — Apple Intelligence training opt-in
// - Meta-ExternalAgent, FacebookBot — Meta's LLaMA family training
// - Amazonbot — Alexa+ retrieval
// - YouBot, cohere-ai, DuckAssistBot — assistant retrievers
const AI_USER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
  'Bytespider',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'FacebookBot',
  'Amazonbot',
  'YouBot',
  'cohere-ai',
  'DuckAssistBot',
] as const;

const DISALLOW = [
  '/admin',
  '/admin/',
  '/api/',
  '/cart',
  '/cart/',
  '/checkout/',
  '/account/',
  '/search',
  '/*?*',
];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
