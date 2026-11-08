"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ArrowUpRight, ChevronLeft, ChevronRight, Clock3, History, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { getVisits } from "@/lib/api";
import type { Person, VisitPage } from "@/types/api";

interface HistoryPanelProps {
  person: Person;
  refreshToken: number;
  onNavigate: (address: string) => void;
}

function describeHistoryError(error: unknown): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    return Array.isArray(message)
      ? message.join(" ")
      : message ?? "History could not be loaded. Check the API connection and try again.";
  }

  return "History could not be loaded. Please try again.";
}

export default function HistoryPanel({ person, refreshToken, onNavigate }: HistoryPanelProps) {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<VisitPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getVisits(person._id, page, controller.signal)
      .then((history) => {
        setResult(history);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(describeHistoryError(requestError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, person._id, refreshToken, retryToken]);

  function changePage(nextPage: number) {
    if (nextPage < 1 || (result && nextPage > result.totalPages)) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setPage(nextPage);
  }

  function retry() {
    setLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  const totalPages = Math.max(result?.totalPages ?? 0, 1);
  const firstItem = result?.total ? (page - 1) * (result.limit) + 1 : 0;
  const lastItem = result ? Math.min(page * result.limit, result.total) : 0;

  return (
    <aside className="overflow-hidden rounded-3xl border border-[#e2ded5] bg-white shadow-[0_18px_48px_-36px_rgba(31,42,36,0.4)] lg:sticky lg:top-24" aria-label="Browsing history">
      <div className="border-b border-[#e2ded5] bg-[#faf9f6] px-5 py-4">
        <div className="flex items-center gap-2 text-[#426b5a]">
          <History size={17} aria-hidden="true" />
          <h2 className="font-display text-2xl font-normal text-[#1b1f1d]">History</h2>
        </div>
        <p className="mt-1 text-xs text-[#829089]">Pages visited by {person.name}</p>
      </div>

      <div className="flex items-center justify-between px-5 py-3 text-xs text-[#829089]">
        <span>{result ? `${firstItem}–${lastItem} of ${result.total}` : "Recent visits"}</span>
        <button
          suppressHydrationWarning
          type="button"
          onClick={retry}
          disabled={loading}
          className="rounded-md p-1 text-[#668077] transition hover:bg-[#eef4f0] disabled:opacity-40"
          aria-label="Refresh history"
          title="Refresh history"
        >
          <RotateCw size={15} />
        </button>
      </div>

      {error && (
        <div className="mx-4 mb-3 rounded-xl border border-[#f0d5ce] bg-[#fff8f5] p-3" role="alert">
          <p className="text-xs leading-5 text-[#93483e]">{error}</p>
          <button suppressHydrationWarning type="button" onClick={retry} className="mt-2 text-xs font-semibold text-[#93483e] underline underline-offset-2">
            Try again
          </button>
        </div>
      )}

      <div className="hide-scrollbar max-h-[calc(100vh-16rem)] min-h-44 overflow-y-auto px-3 pb-2" aria-live="polite">
        {!error && !loading && result?.items.length === 0 && (
          <div className="flex min-h-40 flex-col items-center justify-center px-4 text-center">
            <Clock3 size={21} className="text-[#8ba197]" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-[#53675e]">No visits yet</p>
            <p className="mt-1 text-xs leading-5 text-[#89958f]">Pages you open will appear here.</p>
          </div>
        )}

        {result?.items.map((visit, index) => (
          <motion.button
            suppressHydrationWarning
            key={visit._id}
            type="button"
            onClick={() => onNavigate(visit.address)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 8) * 0.025, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="group mb-1 block w-full rounded-xl px-3 py-3 text-left transition hover:bg-[#f3f7f4] focus:bg-[#f3f7f4] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#9dbbac]"
            aria-label={`Visit ${visit.address} from history`}
          >
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[#2d433a]">{visit.address}</span>
                <span className="mt-1 block text-[11px] text-[#87948d]">
                  {format(new Date(visit.visitedAt), "MMM d, yyyy · h:mm a")}
                </span>
              </span>
              <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-[#a1afa8] transition group-hover:text-[#4f7b68]" aria-hidden="true" />
            </span>
            <span className="mt-2 inline-flex rounded-full bg-[#eff4f1] px-2 py-0.5 text-[10px] capitalize text-[#6c8278]">
              {visit.source}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[#e2ded5] bg-[#faf9f6] px-4 py-3">
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => changePage(page - 1)}
          disabled={page <= 1 || loading}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#5a7468] transition hover:bg-[#edf3ef] disabled:cursor-not-allowed disabled:text-[#b6c0bb] disabled:hover:bg-transparent"
        >
          <ChevronLeft size={15} aria-hidden="true" /> Previous
        </button>
        <span className="text-[11px] text-[#87948d]">Page {page} of {totalPages}</span>
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => changePage(page + 1)}
          disabled={!result || page >= result.totalPages || loading}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#5a7468] transition hover:bg-[#edf3ef] disabled:cursor-not-allowed disabled:text-[#b6c0bb] disabled:hover:bg-transparent"
        >
          Next <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
