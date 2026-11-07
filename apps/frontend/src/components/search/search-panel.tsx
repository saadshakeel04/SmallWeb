"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import { AlertCircle, ArrowUpRight, FileSearch, Search } from "lucide-react";
import { motion } from "framer-motion";
import { searchSites } from "@/lib/api";
import type { SearchResult } from "@/types/api";

interface SearchPanelProps {
  onNavigate: (address: string) => void;
}

type SearchState = "idle" | "loading" | "results" | "empty" | "error";

function describeSearchError(error: unknown): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    return Array.isArray(message)
      ? message.join(" ")
      : message ?? "Search could not be completed. Check the API connection and try again.";
  }

  return "Search could not be completed. Please try again.";
}

export default function SearchPanel({ onNavigate }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<SearchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(
    () => () => activeRequest.current?.abort(),
    [],
  );

  async function runSearch(searchQuery: string) {
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) {
      activeRequest.current?.abort();
      setSearchedQuery("");
      setResults([]);
      setTotal(0);
      setError(null);
      setState("idle");
      return;
    }

    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setSearchedQuery(normalizedQuery);
    setResults([]);
    setTotal(0);
    setError(null);
    setState("loading");

    try {
      const response = await searchSites(normalizedQuery, controller.signal);
      if (controller.signal.aborted) return;
      setResults(response.results);
      setTotal(response.total);
      setState(response.results.length > 0 ? "results" : "empty");
    } catch (requestError) {
      if (controller.signal.aborted) return;
      setError(describeSearchError(requestError));
      setState("error");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(query);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[#e2ded5] bg-white shadow-[0_18px_48px_-36px_rgba(31,42,36,0.4)]" aria-label="Search the Small Web">
      <div className="border-b border-[#e2ded5] bg-[#faf9f6] px-5 py-4">
        <div className="flex items-center gap-2 text-[#426b5a]">
          <Search size={17} aria-hidden="true" />
          <h2 className="font-display text-2xl font-normal text-[#1b1f1d]">Search the web</h2>
        </div>
        <p className="mt-1 text-xs text-[#829089]">Find words in titles and page text</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <label htmlFor="small-web-search" className="sr-only">Search all websites</label>
        <div className="flex items-center gap-2 rounded-xl border border-[#dce5e0] bg-white px-3 py-1.5 focus-within:border-[#78a591] focus-within:ring-4 focus-within:ring-[#e4f0ea]">
          <input
            id="small-web-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “unusual birds”"
            maxLength={100}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#233a32] outline-none placeholder:text-[#9ba8a2]"
          />
          <button
            type="submit"
            disabled={state === "loading" || !query.trim()}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#173f35] text-white transition hover:bg-[#245747] disabled:cursor-not-allowed disabled:bg-[#a8b8b1]"
            aria-label="Search"
          >
            <Search size={16} aria-hidden="true" />
          </button>
        </div>
      </form>

      <div className="hide-scrollbar max-h-[calc(100vh-16rem)] min-h-40 overflow-y-auto px-3 pb-3" aria-live="polite">
        {state === "idle" && (
          <div className="flex min-h-36 flex-col items-center justify-center px-5 text-center">
            <FileSearch size={22} className="text-[#8ba197]" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-[#53675e]">Search every little site</p>
            <p className="mt-1 text-xs leading-5 text-[#89958f]">Results include matching page content, not just titles.</p>
          </div>
        )}

        {state === "empty" && (
          <div className="flex min-h-36 flex-col items-center justify-center px-5 text-center" role="status">
            <FileSearch size={22} className="text-[#8ba197]" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-[#53675e]">No matches for “{searchedQuery}”</p>
            <p className="mt-1 text-xs leading-5 text-[#89958f]">Try a different word or phrase.</p>
          </div>
        )}

        {state === "error" && (
          <div className="mx-1 my-2 rounded-xl border border-[#f0d5ce] bg-[#fff8f5] p-3" role="alert">
            <div className="flex items-start gap-2 text-xs leading-5 text-[#93483e]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {state === "results" && (
          <div>
            <p className="px-3 pb-2 text-[11px] text-[#829089]">
              {total > results.length
                ? `Showing ${results.length} of ${total} results`
                : `${total} ${total === 1 ? "result" : "results"}`} for “{searchedQuery}”
            </p>
            {results.map((result) => (
              <motion.button
                key={result.address}
                type="button"
                onClick={() => onNavigate(result.address)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="group mb-1 block w-full rounded-xl px-3 py-3 text-left transition hover:bg-[#f3f7f4] focus:bg-[#f3f7f4] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#9dbbac]"
                aria-label={`Open ${result.title} at ${result.address}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-5 text-[#2d433a]">{result.title}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-[#6e887c]">{result.address}</span>
                  </span>
                  <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-[#a1afa8] transition group-hover:text-[#4f7b68]" aria-hidden="true" />
                </span>
                <span className="mt-2 block text-xs leading-5 text-[#77857e]">{result.excerpt}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
