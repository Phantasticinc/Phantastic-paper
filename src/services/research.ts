/**
 * Per-ticker research adapter. The original returned a short AI "take" plus recent news
 * headlines from a server function. No news/LLM backend is bundled here, so the default
 * reports that research is not connected. Implement `ResearchProvider` to plug one in.
 */
export interface ResearchRequest {
  symbol: string;
  name?: string;
  price: number;
  changePct: number;
  high?: number;
  low?: number;
  volume?: number;
}
export interface NewsItem {
  title: string;
  url: string;
  publisher?: string;
  publishedAt?: number;
}
export type ResearchResult =
  | { ok: true; take: string | null; news: NewsItem[] }
  | { ok: false; error: string };

export interface ResearchProvider {
  research(req: ResearchRequest): Promise<ResearchResult>;
}

let provider: ResearchProvider = {
  async research() {
    return {
      ok: false,
      error:
        "Research isn’t connected in this build (no news or model backend).",
    };
  },
};
export const setResearchProvider = (p: ResearchProvider) => {
  provider = p;
};
export const fetchResearch = ({ data }: { data: ResearchRequest }) =>
  provider.research(data);
