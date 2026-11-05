"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Globe2,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getPeople, getSite } from "@/lib/api";
import { useBrowserStore } from "@/stores/browser-store";
import type { Person, Site } from "@/types/api";

type PageState = "idle" | "loading" | "loaded" | "not-found" | "error";

function describeRequestError(error: unknown): string {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    if (error.response?.status === 404) {
      return "That address is not in the Small Web yet. Check the spelling or try another address.";
    }

    if (error.response) {
      const message = error.response.data?.message;
      return Array.isArray(message)
        ? message.join(" ")
        : message ?? "The request could not be completed.";
    }

    return "The Small Web API could not be reached. Check that the backend is running.";
  }

  return "Something went wrong while loading this page. Please try again.";
}

export default function BrowserShell() {
  const selectedPerson = useBrowserStore((state) => state.selectedPerson);
  const setSelectedPerson = useBrowserStore((state) => state.setSelectedPerson);
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [pageState, setPageState] = useState<PageState>("idle");
  const [site, setSite] = useState<Site | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadPeople = useCallback(async (signal?: AbortSignal) => {
    setPeopleLoading(true);
    setPeopleError(null);
    try {
      setPeople(await getPeople(signal));
    } catch (error) {
      if (signal?.aborted) return;
      setPeopleError(describeRequestError(error));
    } finally {
      if (!signal?.aborted) setPeopleLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getPeople(controller.signal)
      .then((result) => setPeople(result))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setPeopleError(describeRequestError(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setPeopleLoading(false);
      });
    return () => controller.abort();
  }, []);

  function handlePersonChange(personId: string) {
    setSelectedPerson(people.find((person) => person._id === personId) ?? null);
  }

  async function handleNavigate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedAddress = address.trim().toLowerCase();
    if (!normalizedAddress) return;

    if (!selectedPerson) {
      setPageError("Choose a visitor before browsing the Small Web.");
      setPageState("error");
      return;
    }

    setAddress(normalizedAddress);
    setPageError(null);
    setSite(null);
    setPageState("loading");

    try {
      const result = await getSite(normalizedAddress);
      setSite(result);
      setAddress(result.address);
      setPageState("loaded");
    } catch (error) {
      setPageError(describeRequestError(error));
      setPageState(
        axios.isAxiosError(error) && error.response?.status === 404
          ? "not-found"
          : "error",
      );
    }
  }

  const visitorLabel = selectedPerson?.name ?? "Choose a visitor";

  return (
    <main className="min-h-screen px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#173f35] text-white shadow-sm">
              <Globe2 size={23} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#55726a]">
                A little place to wander
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-[#192b27] sm:text-[1.7rem]">
                The Small Web
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:min-w-64">
            <label
              htmlFor="visitor"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-[#64736f]"
            >
              Browsing as
            </label>
            <div className="relative">
              <select
                id="visitor"
                value={selectedPerson?._id ?? ""}
                onChange={(event) => handlePersonChange(event.target.value)}
                disabled={peopleLoading || people.length === 0}
                className="w-full appearance-none rounded-xl border border-[#dce3df] bg-white px-4 py-3 pr-10 text-sm font-medium text-[#243a34] shadow-sm outline-none transition focus:border-[#538a76] focus:ring-4 focus:ring-[#dbece5] disabled:cursor-not-allowed disabled:bg-[#eef1ef]"
              >
                <option value="">
                  {peopleLoading ? "Loading visitors…" : "Choose a visitor"}
                </option>
                {people.map((person) => (
                  <option key={person._id} value={person._id}>
                    {person.name}
                  </option>
                ))}
              </select>
              {peopleLoading && (
                <LoaderCircle
                  className="absolute right-3 top-3.5 animate-spin text-[#668077]"
                  size={17}
                  aria-label="Loading visitors"
                />
              )}
            </div>
            {peopleError && (
              <div
                className="flex items-center justify-between gap-3 text-xs text-[#a33f37]"
                role="alert"
              >
                <span>{peopleError}</span>
                <button
                  type="button"
                  onClick={() => void loadPeople()}
                  className="shrink-0 font-semibold underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            )}
            {!peopleLoading && !peopleError && people.length === 0 && (
              <p className="text-xs text-[#6f7f79]">
                No visitors yet. Run the backend seed command to add sample people.
              </p>
            )}
          </div>
        </header>

        <section
          className="overflow-hidden rounded-[1.75rem] border border-[#dfe5e2] bg-white shadow-[0_18px_55px_-35px_rgba(26,55,46,0.3)]"
          aria-label="Small Web browser"
        >
          <div className="flex items-center gap-4 border-b border-[#e7ece9] bg-[#fbfcfb] px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2" aria-label="Browser navigation">
              <button
                type="button"
                disabled
                aria-label="Back"
                title="Back"
                className="flex size-9 cursor-not-allowed items-center justify-center rounded-full text-[#aab5b0]"
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled
                aria-label="Forward"
                title="Forward"
                className="flex size-9 cursor-not-allowed items-center justify-center rounded-full text-[#aab5b0]"
              >
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleNavigate}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#dce5e0] bg-white px-3 py-1.5 shadow-inner shadow-[#253c3210] focus-within:border-[#78a591] focus-within:ring-4 focus-within:ring-[#e4f0ea]"
            >
              <ShieldCheck
                size={17}
                className="shrink-0 text-[#4d806d]"
                aria-label="Internal Small Web address"
              />
              <label htmlFor="address" className="sr-only">
                Website address
              </label>
              <input
                id="address"
                type="text"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter a Small Web address"
                aria-describedby="address-help"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#233a32] outline-none placeholder:text-[#9ba8a2]"
              />
              <button
                type="submit"
                disabled={pageState === "loading" || !address.trim()}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#173f35] text-white transition hover:bg-[#245747] disabled:cursor-not-allowed disabled:bg-[#a8b8b1]"
                aria-label="Go to address"
              >
                {pageState === "loading" ? (
                  <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Search size={17} aria-hidden="true" />
                )}
              </button>
            </form>
          </div>
          <p id="address-help" className="sr-only">
            Enter a fictional .zz address, such as tidepool.zz.
          </p>

          <div className="min-h-[27rem] bg-[radial-gradient(ellipse_at_top,_#f1f7f4_0%,_#ffffff_56%)] px-5 py-8 sm:px-10 sm:py-12">
            {pageState === "loading" && (
              <div
                className="mx-auto flex max-w-md flex-col items-center py-20 text-center"
                role="status"
              >
                <LoaderCircle size={30} className="animate-spin text-[#4d806d]" aria-hidden="true" />
                <p className="mt-4 text-sm font-medium text-[#38564b]">
                  Looking for that corner of the web…
                </p>
              </div>
            )}

            {(pageState === "error" || pageState === "not-found") && (
              <div
                className="mx-auto max-w-lg rounded-2xl border border-[#eadbd6] bg-white p-7 shadow-sm"
                role="alert"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a05b4d]">
                  {pageState === "not-found" ? "Address not found" : "Could not load page"}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#293b35]">
                  {pageState === "not-found" ? address : "A small connection hiccup"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6c7974]">{pageError}</p>
              </div>
            )}

            {pageState === "loaded" && site && (
              <article className="mx-auto max-w-3xl rounded-2xl border border-[#e0e8e3] bg-white/95 p-6 shadow-sm sm:p-9">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#668077]">
                  <span className="rounded-full bg-[#eaf3ee] px-3 py-1">{site.address}</span>
                  <span>
                    Published by {people.find((person) => person._id === site.authorId)?.name ?? "a Small Web neighbor"}
                  </span>
                </div>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#1f3930] sm:text-4xl">
                  {site.title}
                </h2>
                <div className="my-6 h-px bg-[#e8eeea]" />
                <p className="whitespace-pre-wrap text-[0.98rem] leading-8 text-[#485c54]">
                  {site.plainText}
                </p>
                <div className="mt-8 flex items-center gap-2 border-t border-[#edf1ee] pt-5 text-xs text-[#7d8c85]">
                  <ShieldCheck size={15} aria-hidden="true" />
                  <span>Page content is shown as text while safe page rendering is being built.</span>
                </div>
              </article>
            )}

            {pageState === "idle" && (
              <div className="mx-auto max-w-xl py-12 text-center sm:py-16">
                <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-[#e9f2ed] text-[#39705b]">
                  <Compass size={30} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#6c897e]">
                  A web made of small places
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#203b32]">
                  Where would you like to wander?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#708079]">
                  Choose who is browsing, then enter a .zz address. Each page lives inside this little world.
                </p>
                <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#e3ebe6] bg-white px-4 py-2 text-xs font-medium text-[#678077] shadow-sm">
                  <Sparkles size={14} aria-hidden="true" /> Try <span className="font-mono text-[#355b4d]">tidepool.zz</span>
                </div>
              </div>
            )}
          </div>

          <footer className="flex flex-col gap-1 border-t border-[#e7ece9] bg-[#fbfcfb] px-5 py-3 text-xs text-[#819089] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>{selectedPerson ? `Browsing as ${visitorLabel}` : "Select a visitor to begin"}</span>
            <span>Only addresses in the Small Web are available</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
