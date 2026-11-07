"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, ChevronDown, LoaderCircle, X } from "lucide-react";
import { publishSite } from "@/lib/api";
import type { Person } from "@/types/api";

interface PublishPanelProps {
  open: boolean;
  people: Person[];
  defaultPublisherId: string;
  onClose: () => void;
  onVisit: (address: string) => void;
}

type PublishState = "idle" | "loading" | "success" | "error";

const fieldClass =
  "w-full rounded-xl border border-[#e2ded5] bg-white px-3.5 py-2.5 text-[14px] text-[#303a33] placeholder:text-[#979a91] outline-none transition focus:border-[#879d8f] focus:ring-4 focus:ring-[#e8eee8]";

function describePublishError(error: unknown): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    return Array.isArray(message)
      ? message.join(" ")
      : message ?? "The website could not be published. Check the API connection and try again.";
  }
  return "The website could not be published. Please try again.";
}

export default function PublishPanel({
  open,
  people,
  defaultPublisherId,
  onClose,
  onVisit,
}: PublishPanelProps) {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [publisherId, setPublisherId] = useState(defaultPublisherId);
  const [state, setState] = useState<PublishState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [publishedAddress, setPublishedAddress] = useState<string | null>(null);
  const selectedPublisherId = publisherId || defaultPublisherId;

  useEffect(() => {
    if (!open) return;
    setSlug("");
    setTitle("");
    setHtml("");
    setPublisherId(defaultPublisherId);
    setState("idle");
    setError(null);
    setPublishedAddress(null);
  }, [open, defaultPublisherId]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setError(null);
    setPublishedAddress(null);
    const cleanSlug = slug.trim().toLowerCase().replace(/\.zz$/, "");

    try {
      const site = await publishSite({
        address: `${cleanSlug}.zz`,
        title: title.trim(),
        html,
        publisherId: selectedPublisherId,
      });
      setSlug("");
      setTitle("");
      setHtml("");
      setPublisherId(defaultPublisherId);
      setPublishedAddress(site.address);
      setState("success");
    } catch (publishError) {
      setError(describePublishError(publishError));
      setState("error");
    }
  }

  function clearFeedback() {
    setState("idle");
    setError(null);
    setPublishedAddress(null);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-5">
          <motion.button
            type="button"
            aria-label="Close publish dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-[#242a26]/35 backdrop-blur-[3px]"
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-title"
            initial={{ opacity: 0, y: 22, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="hide-scrollbar relative max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl border border-[#e2ded5] bg-[#fffefa] px-5 pb-5 pt-6 shadow-[0_28px_90px_-30px_rgba(20,27,23,0.48)] sm:max-w-xl sm:rounded-3xl sm:px-8 sm:pb-7 sm:pt-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#7b887e]">Publish</p>
                <h2 id="publish-title" className="mt-1 font-display text-3xl font-normal text-[#202b24] sm:text-[2.1rem]">
                  Add a site to the web
                </h2>
                <p className="mt-2 max-w-md text-[13px] leading-5 text-[#666e67]">
                  Choose an address, then write your page as HTML. Safe `.zz` links can lead to another small place.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#727970] transition hover:bg-[#f1efe9] hover:text-[#26332c]"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[#303a33]">Publishing as</span>
                <span className="relative block">
                  <select
                    required
                    value={selectedPublisherId}
                    onChange={(event) => { setPublisherId(event.target.value); clearFeedback(); }}
                    disabled={people.length === 0}
                    className={`${fieldClass} appearance-none pr-10 disabled:bg-[#f6f5f1]`}
                  >
                    <option value="" disabled>Choose a publisher</option>
                    {people.map((person) => <option key={person._id} value={person._id}>{person.name}</option>)}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777f79]" aria-hidden="true" />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[#303a33]">Address</span>
                <span className="flex overflow-hidden rounded-xl border border-[#e2ded5] bg-white transition focus-within:border-[#879d8f] focus-within:ring-4 focus-within:ring-[#e8eee8]">
                  <input
                    required
                    pattern="[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*"
                    maxLength={249}
                    value={slug}
                    onChange={(event) => { setSlug(event.target.value); clearFeedback(); }}
                    placeholder="my-garden"
                    spellCheck={false}
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 font-mono text-[13px] text-[#303a33] placeholder:font-sans placeholder:text-[#979a91] outline-none"
                  />
                  <span className="flex items-center border-l border-[#e2ded5] bg-[#faf9f6] px-3.5 font-mono text-[13px] text-[#737b73]">.zz</span>
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[#303a33]">Title</span>
                <input
                  required
                  maxLength={160}
                  value={title}
                  onChange={(event) => { setTitle(event.target.value); clearFeedback(); }}
                  placeholder="The garden, in pencil"
                  className={fieldClass}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium text-[#303a33]">Page</span>
                <textarea
                  required
                  maxLength={50000}
                  rows={6}
                  value={html}
                  onChange={(event) => { setHtml(event.target.value); clearFeedback(); }}
                  placeholder={'Write your page using safe HTML.\n\nFor example: <p>Visit <a href="https://tidepool.zz">the tide pools</a>.</p>'}
                  className={`${fieldClass} hide-scrollbar min-h-36 resize-y font-mono text-[12px] leading-5`}
                />
                <span className="mt-1 block text-[11px] text-[#858c85]">Unsafe tags and external links are removed before saving.</span>
              </label>

              {state === "error" && (
                <div className="flex items-start gap-2 rounded-xl border border-[#ead7cf] bg-[#fcf6f2] p-3 text-[13px] leading-5 text-[#8d5147]" role="alert">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {state === "success" && publishedAddress && (
                <div className="rounded-xl border border-[#d4e2d6] bg-[#f2f7f1] p-3.5" role="status">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-[#386451]">
                    <CheckCircle2 size={16} aria-hidden="true" /> Published {publishedAddress}
                  </div>
                  <button type="button" onClick={() => { onVisit(publishedAddress); onClose(); }} className="mt-2 text-[13px] font-semibold text-[#275a49] underline decoration-[#a7c0ad] underline-offset-2 hover:text-[#163f34]">
                    Visit your new site
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 rounded-full px-5 text-[13px] font-medium text-[#687169] transition hover:bg-[#f3f1ec] hover:text-[#25332b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={state === "loading" || people.length === 0}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0f5a4c] px-6 text-[13px] font-medium text-white shadow-sm transition hover:bg-[#174b43] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {state === "loading" && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
                  {state === "loading" ? "Publishing…" : "Publish site"}
                </button>
              </div>
            </form>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}
