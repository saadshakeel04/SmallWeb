"use client";

import { useState, type FormEvent } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle2, LoaderCircle, PenLine } from "lucide-react";
import { publishSite } from "@/lib/api";
import type { Person } from "@/types/api";

interface PublishPanelProps {
  people: Person[];
  defaultPublisherId: string;
  onVisit: (address: string) => void;
}

type PublishState = "idle" | "loading" | "success" | "error";

function describePublishError(error: unknown): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    return Array.isArray(message)
      ? message.join(" ")
      : message ?? "The website could not be published. Check the API connection and try again.";
  }
  return "The website could not be published. Please try again.";
}

export default function PublishPanel({ people, defaultPublisherId, onVisit }: PublishPanelProps) {
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [publisherId, setPublisherId] = useState(defaultPublisherId);
  const [state, setState] = useState<PublishState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [publishedAddress, setPublishedAddress] = useState<string | null>(null);
  const selectedPublisherId = publisherId || defaultPublisherId;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setError(null);
    setPublishedAddress(null);

    try {
      const site = await publishSite({
        address: address.trim().toLowerCase(),
        title: title.trim(),
        html,
        publisherId: selectedPublisherId,
      });
      setPublishedAddress(site.address);
      setAddress(site.address);
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
    <section className="overflow-hidden rounded-[1.5rem] border border-[#dfe5e2] bg-white shadow-[0_18px_55px_-35px_rgba(26,55,46,0.28)]" aria-label="Publish a website">
      <div className="border-b border-[#e8eeea] bg-[#fbfcfb] px-5 py-4">
        <div className="flex items-center gap-2 text-[#426b5a]">
          <PenLine size={16} aria-hidden="true" />
          <h2 className="text-sm font-semibold text-[#263d34]">Publish a small site</h2>
        </div>
        <p className="mt-1 text-xs text-[#829089]">Create a new place on the Small Web</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 p-4">
        <div>
          <label htmlFor="publish-address" className="mb-1 block text-xs font-medium text-[#53675e]">Website address</label>
          <input
            id="publish-address"
            required
            pattern="[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*[.]zz"
            maxLength={253}
            value={address}
            onChange={(event) => { setAddress(event.target.value); clearFeedback(); }}
            placeholder="my-little-site.zz"
            className="w-full rounded-xl border border-[#dce5e0] px-3 py-2.5 text-sm text-[#233a32] outline-none focus:border-[#78a591] focus:ring-4 focus:ring-[#e4f0ea]"
          />
          <p className="mt-1 text-[10px] text-[#89958f]">Use letters, numbers, and hyphens, ending in .zz</p>
        </div>

        <div>
          <label htmlFor="publish-title" className="mb-1 block text-xs font-medium text-[#53675e]">Website title</label>
          <input
            id="publish-title"
            required
            maxLength={160}
            value={title}
            onChange={(event) => { setTitle(event.target.value); clearFeedback(); }}
            placeholder="A title for your page"
            className="w-full rounded-xl border border-[#dce5e0] px-3 py-2.5 text-sm text-[#233a32] outline-none focus:border-[#78a591] focus:ring-4 focus:ring-[#e4f0ea]"
          />
        </div>

        <div>
          <label htmlFor="publish-person" className="mb-1 block text-xs font-medium text-[#53675e]">Publisher</label>
          <select
            id="publish-person"
            required
            value={selectedPublisherId}
            onChange={(event) => { setPublisherId(event.target.value); clearFeedback(); }}
            disabled={people.length === 0}
            className="w-full rounded-xl border border-[#dce5e0] bg-white px-3 py-2.5 text-sm text-[#233a32] outline-none focus:border-[#78a591] focus:ring-4 focus:ring-[#e4f0ea] disabled:bg-[#eef1ef]"
          >
            <option value="" disabled>Choose a publisher</option>
            {people.map((person) => <option key={person._id} value={person._id}>{person.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="publish-html" className="mb-1 block text-xs font-medium text-[#53675e]">HTML content</label>
          <textarea
            id="publish-html"
            required
            maxLength={50000}
            rows={7}
            value={html}
            onChange={(event) => { setHtml(event.target.value); clearFeedback(); }}
            placeholder="<h1>Hello, Small Web</h1>\n<p>Write something kind.</p>"
            className="w-full resize-y rounded-xl border border-[#dce5e0] px-3 py-2.5 font-mono text-xs leading-5 text-[#233a32] outline-none focus:border-[#78a591] focus:ring-4 focus:ring-[#e4f0ea]"
          />
          <p className="mt-1 text-[10px] text-[#89958f]">Unsafe tags and links are removed before saving.</p>
        </div>

        {state === "error" && (
          <div className="flex items-start gap-2 rounded-xl border border-[#f0d5ce] bg-[#fff8f5] p-3 text-xs leading-5 text-[#93483e]" role="alert">
            <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {state === "success" && publishedAddress && (
          <div className="rounded-xl border border-[#cfe4d7] bg-[#f4faf6] p-3" role="status">
            <div className="flex items-center gap-2 text-xs font-medium text-[#37684f]">
              <CheckCircle2 size={15} aria-hidden="true" /> Published {publishedAddress}
            </div>
            <button type="button" onClick={() => onVisit(publishedAddress)} className="mt-2 text-xs font-semibold text-[#315b49] underline decoration-[#9dbbac] underline-offset-2 hover:text-[#173f35]">
              Visit your new site
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={state === "loading" || people.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#173f35] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#245747] disabled:cursor-not-allowed disabled:bg-[#a8b8b1]"
        >
          {state === "loading" ? <><LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Publishing…</> : "Publish website"}
        </button>
      </form>
    </section>
  );
}
