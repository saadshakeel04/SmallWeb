"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import { AnimatePresence, MotionConfig, motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Globe2,
  History as HistoryIcon,
  House,
  PenLine,
  Search,
  ShieldCheck,
} from "lucide-react";
import SiteFrame from "@/components/browser/site-frame";
import HistoryPanel from "@/components/history/history-panel";
import SearchPanel from "@/components/search/search-panel";
import PublishPanel from "@/components/publish/publish-panel";
import PersonDropdown from "@/components/browser/person-dropdown";
import { getPeople, getSite, getSites, recordVisit } from "@/lib/api";
import { useBrowserStore } from "@/stores/browser-store";
import type { DirectorySite, NavigationSource, Person } from "@/types/api";

type RequestState = "idle" | "loading" | "not-found" | "error";

const directoryListVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const directoryCardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32 } },
};

const pageTransitionVariants: Variants = {
  enter: (direction: 1 | -1) => ({ opacity: 0, x: direction * 34 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: 1 | -1) => ({ opacity: 0, x: direction * -34 }),
};

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
  const navigationEntries = useBrowserStore((state) => state.navigationEntries);
  const currentNavigationIndex = useBrowserStore((state) => state.currentNavigationIndex);
  const navigate = useBrowserStore((state) => state.navigate);
  const goHome = useBrowserStore((state) => state.goHome);
  const goBack = useBrowserStore((state) => state.goBack);
  const goForward = useBrowserStore((state) => state.goForward);
  const saveScrollPosition = useBrowserStore((state) => state.saveScrollPosition);
  const currentEntry = navigationEntries[currentNavigationIndex] ?? null;

  const [people, setPeople] = useState<Person[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const [directorySites, setDirectorySites] = useState<DirectorySite[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [directoryError, setDirectoryError] = useState<string | null>(null);
  const [storeHydrated, setStoreHydrated] = useState(false);
  const [address, setAddress] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [pageError, setPageError] = useState<string | null>(null);
  const [visitSaveError, setVisitSaveError] = useState<string | null>(null);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<"history" | "search">("history");
  const [sidebarDirection, setSidebarDirection] = useState<1 | -1>(1);
  const [publishOpen, setPublishOpen] = useState(false);
  const [navigationDirection, setNavigationDirection] = useState<1 | -1>(1);
  const navigationRequestId = useRef(0);

  const loadPeople = useCallback(async (signal?: AbortSignal) => {
    setPeopleLoading(true);
    setPeopleError(null);
    try {
      const nextPeople = await getPeople(signal);
      if (signal?.aborted) return;
      setPeople(nextPeople);
      const storedPerson = useBrowserStore.getState().selectedPerson;
      if (storedPerson) {
        setSelectedPerson(nextPeople.find((person) => person._id === storedPerson._id) ?? null);
      }
    } catch (error) {
      if (signal?.aborted) return;
      setPeopleError(describeRequestError(error));
    } finally {
      if (!signal?.aborted) setPeopleLoading(false);
    }
  }, [setSelectedPerson]);

  const loadDirectory = useCallback(async (signal?: AbortSignal) => {
    setDirectoryLoading(true);
    setDirectoryError(null);
    try {
      setDirectorySites(await getSites(signal));
    } catch (error) {
      if (signal?.aborted) return;
      setDirectoryError(describeRequestError(error));
    } finally {
      if (!signal?.aborted) setDirectoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function initializeBrowser() {
      try {
        await useBrowserStore.persist.rehydrate();
      } catch {
        // Keep the in-memory defaults when browser storage is unavailable.
      }

      if (controller.signal.aborted) return;
      const restoredState = useBrowserStore.getState();
      const restoredEntry = restoredState.navigationEntries[restoredState.currentNavigationIndex];
      setAddress(restoredEntry?.address ?? "");
      setStoreHydrated(true);

      const [peopleResult, sitesResult] = await Promise.allSettled([
        getPeople(controller.signal),
        getSites(controller.signal),
      ]);
      if (controller.signal.aborted) return;

      if (peopleResult.status === "fulfilled") {
        setPeople(peopleResult.value);
        setPeopleError(null);
        const storedPerson = useBrowserStore.getState().selectedPerson;
        if (storedPerson) {
          setSelectedPerson(peopleResult.value.find((person) => person._id === storedPerson._id) ?? null);
        }
      } else {
        setPeopleError(describeRequestError(peopleResult.reason));
      }
      setPeopleLoading(false);

      if (sitesResult.status === "fulfilled") {
        setDirectorySites(sitesResult.value);
        setDirectoryError(null);
      } else {
        setDirectoryError(describeRequestError(sitesResult.reason));
      }
      setDirectoryLoading(false);
    }
    void initializeBrowser();
    return () => controller.abort();
  }, [setSelectedPerson]);

  function handlePersonChange(personId: string) {
    navigationRequestId.current += 1;
    setRequestState("idle");
    setPageError(null);
    setSelectedPerson(people.find((person) => person._id === personId) ?? null);
    setVisitSaveError(null);
  }

  const navigateToAddress = useCallback(
    async (requestedAddress: string, source: NavigationSource) => {
      const normalizedAddress = requestedAddress.trim().toLowerCase();
      if (!normalizedAddress) return;

      if (!selectedPerson) {
        navigationRequestId.current += 1;
        setPageError("Choose a visitor before browsing the Small Web.");
        setRequestState("error");
        return;
      }

      const requestId = ++navigationRequestId.current;
      setAddress(normalizedAddress);
      setPageError(null);
      setVisitSaveError(null);
      setRequestState("loading");

      try {
        const site = await getSite(normalizedAddress);
        if (requestId !== navigationRequestId.current) return;
        setNavigationDirection(1);
        navigate(site, source);
        setAddress(site.address);
        setRequestState("idle");
        setVisitSaveError(null);

        try {
          await recordVisit({
            personId: selectedPerson._id,
            address: site.address,
            source,
          });
          setHistoryRefreshToken((token) => token + 1);
        } catch {
          if (requestId === navigationRequestId.current) {
            setVisitSaveError("This page opened, but the visit could not be saved. Open it again to retry.");
          }
        }
      } catch (error) {
        if (requestId !== navigationRequestId.current) return;
        setPageError(describeRequestError(error));
        setRequestState(
          axios.isAxiosError(error) && error.response?.status === 404
            ? "not-found"
            : "error",
        );
      }
    },
    [navigate, selectedPerson],
  );

  function handleNavigate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void navigateToAddress(address, "typed");
  }

  function handleBack() {
    const target = navigationEntries[currentNavigationIndex - 1];
    if (!target) return;
    navigationRequestId.current += 1;
    setPageError(null);
    setVisitSaveError(null);
    setRequestState("idle");
    setAddress(target.address);
    setNavigationDirection(-1);
    goBack();
  }

  function handleHome() {
    navigationRequestId.current += 1;
    setPageError(null);
    setVisitSaveError(null);
    setRequestState("idle");
    setAddress("");
    goHome();
  }

  function handleForward() {
    const target = navigationEntries[currentNavigationIndex + 1];
    if (!target) return;
    navigationRequestId.current += 1;
    setPageError(null);
    setVisitSaveError(null);
    setRequestState("idle");
    setAddress(target.address);
    setNavigationDirection(1);
    goForward();
  }

  const handleInternalNavigate = useCallback(
    (nextAddress: string) => void navigateToAddress(nextAddress, "link"),
    [navigateToAddress],
  );
  const handleSearchNavigate = useCallback(
    (nextAddress: string) => void navigateToAddress(nextAddress, "search"),
    [navigateToAddress],
  );
  const handlePublishNavigate = useCallback(
    (nextAddress: string) => {
      setPublishOpen(false);
      void navigateToAddress(nextAddress, "publish");
    },
    [navigateToAddress],
  );
  const handleFrameScroll = useCallback(
    (entryId: string, scrollY: number) => saveScrollPosition(entryId, scrollY),
    [saveScrollPosition],
  );

  const visitorLabel = selectedPerson?.name ?? "Choose a visitor";

  return (
    <MotionConfig reducedMotion="user">
    <main className="min-h-screen bg-[#f3f1ec] text-[#1b1f1d]">
      <header className="sticky top-0 z-30 border-b border-[#e2ded5] bg-[#f3f1ec]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#0f3832] text-white shadow-sm ring-1 ring-[#173c34]/15">
              <Globe2 size={20} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-[1.35rem] leading-none text-[#222b26] sm:text-[1.45rem]">
                The Small Web
              </h1>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.22em] text-[#78837c]">
                A browser for little places
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <PersonDropdown
              people={people}
              selectedPerson={selectedPerson}
              loading={peopleLoading}
              onChange={handlePersonChange}
            />
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setPublishOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0f5a4c] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#174b43] active:scale-[0.97]"
            >
              <PenLine size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Publish</span>
            </button>
            {peopleError && (
              <div className="flex items-center gap-2 text-xs text-[#a33f37]" role="alert">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => void loadPeople()}
                  className="font-medium underline underline-offset-2"
                >
                  Retry
                </button>
                <span className="hidden max-w-32 truncate sm:inline" title={peopleError}>{peopleError}</span>
                <span className="sr-only">{peopleError}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl items-start gap-5 px-4 py-5 sm:px-6 sm:py-7 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-8">
        <section
          className="overflow-hidden rounded-3xl border border-[#e2ded5] bg-white shadow-[0_22px_55px_-42px_rgba(31,42,36,0.5)]"
          aria-label="Small Web browser"
        >
          <div className="flex items-center gap-2 border-b border-[#e2ded5] bg-[#faf9f6] px-3 py-3 sm:gap-3 sm:px-4">
            <div className="flex items-center gap-2" aria-label="Browser navigation">
              <motion.button
                suppressHydrationWarning
                type="button"
                onClick={handleBack}
                disabled={currentNavigationIndex <= 0}
                aria-label="Back"
                title="Back"
                whileTap={{ scale: 0.88 }}
                className="flex size-9 items-center justify-center rounded-full text-[#68766e] transition hover:bg-[#eeece6] active:scale-90 disabled:cursor-not-allowed disabled:text-[#b4b7b0] disabled:hover:bg-transparent"
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </motion.button>
              <motion.button
                suppressHydrationWarning
                type="button"
                onClick={handleForward}
                disabled={currentNavigationIndex >= navigationEntries.length - 1}
                aria-label="Forward"
                title="Forward"
                whileTap={{ scale: 0.88 }}
                className="flex size-9 items-center justify-center rounded-full text-[#68766e] transition hover:bg-[#eeece6] active:scale-90 disabled:cursor-not-allowed disabled:text-[#b4b7b0] disabled:hover:bg-transparent"
              >
                <ArrowRight size={18} aria-hidden="true" />
              </motion.button>
              <motion.button
                suppressHydrationWarning
                type="button"
                onClick={handleHome}
                aria-label="Home"
                title="Home"
                whileTap={{ scale: 0.88 }}
                className="flex size-9 items-center justify-center rounded-full text-[#68766e] transition hover:bg-[#eeece6] active:scale-90"
              >
                <House size={17} aria-hidden="true" />
              </motion.button>
            </div>

            <form
              suppressHydrationWarning
              onSubmit={handleNavigate}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#e2ded5] bg-white px-3 py-1.5 transition focus-within:border-[#92a99b] focus-within:ring-4 focus-within:ring-[#e7eee8]"
            >
              <ShieldCheck
                size={17}
                className="shrink-0 text-[#587c6d]"
                aria-label="Internal Small Web address"
              />
              <label htmlFor="address" className="sr-only">
                Website address
              </label>
              <input
                suppressHydrationWarning
                id="address"
                type="text"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter an address, e.g. tidepool.zz"
                aria-describedby="address-help"
                className="min-w-0 flex-1 bg-transparent py-2 font-mono text-[13px] text-[#34423a] outline-none placeholder:font-sans placeholder:text-[13px] placeholder:text-[#979a91]"
              />
              <button
                suppressHydrationWarning
                type="submit"
                disabled={requestState === "loading" || !address.trim()}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0f5a4c] text-white transition hover:bg-[#174b43] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#a8b8b1]"
                aria-label="Go to address"
              >
                <Search size={17} aria-hidden="true" />
              </button>
            </form>
          </div>
          <p id="address-help" className="sr-only">
            Enter a fictional .zz address, such as tidepool.zz.
          </p>

          {visitSaveError && (
            <p className="mx-5 mt-4 rounded-xl border border-[#f0d5ce] bg-[#fff8f5] px-4 py-3 text-xs leading-5 text-[#93483e] sm:mx-10" role="alert">
              {visitSaveError}
            </p>
          )}

          <div className="hide-scrollbar h-[68vh] min-h-[32rem] overflow-y-auto bg-white px-4 py-5 sm:px-6 sm:py-6">
            {!storeHydrated && (
              <div className="min-h-[62vh]" aria-busy="true" aria-label="Restoring your browser" />
            )}

            {storeHydrated && requestState === "loading" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto flex max-w-md flex-col items-center py-24 text-center"
                role="status"
              >
                <p className="font-display text-2xl text-[#35443b]">Finding that little place…</p>
                <div className="mt-5 h-1 w-36 overflow-hidden rounded-full bg-[#e8eee8]">
                  <motion.span
                    className="block h-full w-1/2 rounded-full bg-[#54806c]"
                    animate={{ x: ["-110%", "210%"] }}
                    transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )}

            {storeHydrated && (requestState === "error" || requestState === "not-found") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mx-auto max-w-lg rounded-3xl border border-[#e6ddd3] bg-[#faf9f6] p-7 shadow-sm"
                role="alert"
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#9a7065]">
                  {requestState === "not-found" ? "Address not found" : "Could not load page"}
                </p>
                <h2 className="mt-2 font-display text-3xl font-normal text-[#27362e]">
                  {requestState === "not-found" ? address : "A small connection hiccup"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#666e67]">{pageError}</p>
              </motion.div>
            )}

            {storeHydrated && requestState === "idle" && currentEntry && (
              <div className="mx-auto max-w-4xl">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#777f79]">
                  <span className="font-display text-lg text-[#34443b]">{currentEntry.title}</span>
                  <span>
                    {currentEntry.address} · by {people.find((person) => person._id === currentEntry.site.authorId)?.name ?? "a Small Web neighbor"}
                  </span>
                </div>
                <AnimatePresence initial={false} mode="wait" custom={navigationDirection}>
                  <motion.div
                    key={currentEntry.id}
                    custom={navigationDirection}
                    variants={pageTransitionVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <SiteFrame
                      entryId={currentEntry.id}
                      site={currentEntry.site}
                      initialScrollY={currentEntry.scrollY}
                      onNavigate={handleInternalNavigate}
                      onScroll={handleFrameScroll}
                    />
                  </motion.div>
                </AnimatePresence>
                <p className="mt-3 flex items-center gap-2 px-1 text-[11px] text-[#858c85]">
                  <ShieldCheck size={14} aria-hidden="true" />
                  Scripts and external page resources are blocked inside this sandbox.
                </p>
              </div>
            )}

            {storeHydrated && requestState === "idle" && !currentEntry && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-5xl py-7 sm:py-10"
              >
                <div className="mx-auto max-w-2xl text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#e8eee8] text-[#416c5d]">
                    <Compass size={27} strokeWidth={1.6} aria-hidden="true" />
                  </div>
                  <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#818981]">
                    Directory · {directorySites.length} small sites
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-normal leading-[1.08] text-[#1e2923] sm:text-5xl">
                    Small sites, written by people.
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-[#646d66]">
                    Choose a site to start wandering. Every address you visit is kept in your history, and links on each page take you further along.
                  </p>
                </div>

                {directoryLoading && (
                  <p className="mt-8 text-center text-sm text-[#777f79]" role="status">Gathering small places…</p>
                )}
                {directoryError && (
                  <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-[#ead7cf] bg-[#fcf6f2] px-4 py-3 text-center text-sm text-[#8d5147]" role="alert">
                    <p>{directoryError}</p>
                    <button suppressHydrationWarning type="button" onClick={() => void loadDirectory()} className="mt-2 font-medium underline underline-offset-2">Try again</button>
                  </div>
                )}
                {!directoryLoading && !directoryError && directorySites.length > 0 && (
                  <motion.ul
                    variants={directoryListVariants}
                    initial="hidden"
                    animate="show"
                    className="mt-8 grid gap-3 sm:grid-cols-2"
                  >
                    {directorySites.map((site) => (
                      <motion.li key={site._id} variants={directoryCardVariants}>
                        <button
                          suppressHydrationWarning
                          type="button"
                          onClick={() => void navigateToAddress(site.address, "typed")}
                          className="group flex h-full min-h-44 w-full flex-col rounded-2xl border border-[#e6e1d8] bg-[#fffefa] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-[#c7d5c9] hover:bg-[#fdfcf8] hover:shadow-[0_12px_30px_-20px_rgba(23,65,52,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e8eee8] sm:p-5"
                        >
                          <span className="flex w-full items-center justify-between gap-3">
                            <span className="font-mono text-[11px] text-[#286252]">{site.address}</span>
                            <ArrowRight size={14} className="shrink-0 text-[#858c85] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                          </span>
                          <span className="mt-3 font-display text-2xl leading-tight text-[#222c25]">{site.title}</span>
                          <span className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#666e67]">{site.plainText}</span>
                          <span className="mt-auto pt-4 text-[11px] text-[#858c85]">
                            by {people.find((person) => person._id === site.authorId)?.name ?? "a Small Web neighbor"}
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
                {!directoryLoading && !directoryError && directorySites.length === 0 && (
                  <p className="mt-8 text-center text-sm text-[#777f79]">No sites have been published yet.</p>
                )}
              </motion.div>
            )}
          </div>

          <footer className="flex flex-col gap-1 border-t border-[#e2ded5] bg-[#faf9f6] px-5 py-3 text-[11px] text-[#858c85] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>{selectedPerson ? `Browsing as ${visitorLabel}` : "Select a visitor to begin"}</span>
            <span>Only addresses in the Small Web are available</span>
          </footer>
        </section>
        <div className="min-w-0">
          <div className="mb-3 flex rounded-2xl border border-[#e2ded5] bg-white p-1 shadow-[0_2px_9px_-6px_rgba(31,42,36,0.45)]" role="tablist" aria-label="Browser side panel">
            <button
              suppressHydrationWarning
              type="button"
              role="tab"
              aria-selected={sidebarTab === "history"}
              aria-controls="history-panel"
              onClick={() => { setSidebarDirection(-1); setSidebarTab("history"); }}
              className={`flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition ${sidebarTab === "history" ? "bg-[#e8eee8] text-[#244f42]" : "text-[#777f79] hover:bg-[#f7f6f2]"}`}
            >
              <HistoryIcon size={14} aria-hidden="true" /> History
            </button>
            <button
              suppressHydrationWarning
              type="button"
              role="tab"
              aria-selected={sidebarTab === "search"}
              aria-controls="search-panel"
              onClick={() => { setSidebarDirection(1); setSidebarTab("search"); }}
              className={`flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition ${sidebarTab === "search" ? "bg-[#e8eee8] text-[#244f42]" : "text-[#777f79] hover:bg-[#f7f6f2]"}`}
            >
              <Search size={14} aria-hidden="true" /> Search
            </button>
          </div>
          <div id="history-panel" role="tabpanel" hidden={sidebarTab !== "history"}>
            <motion.div
              initial={false}
              animate={sidebarTab === "history" ? { opacity: 1, x: 0 } : { opacity: 0, x: sidebarDirection * -22 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {selectedPerson ? (
                <HistoryPanel
                  key={selectedPerson._id}
                  person={selectedPerson}
                  refreshToken={historyRefreshToken}
                  onNavigate={(historyAddress) => void navigateToAddress(historyAddress, "history")}
                />
              ) : (
                <aside className="rounded-3xl border border-[#e2ded5] bg-white p-5 text-sm text-[#69736c] shadow-sm">
                  Choose a visitor to see their browsing history.
                </aside>
              )}
            </motion.div>
          </div>
          <div id="search-panel" role="tabpanel" hidden={sidebarTab !== "search"}>
            <motion.div
              initial={false}
              animate={sidebarTab === "search" ? { opacity: 1, x: 0 } : { opacity: 0, x: sidebarDirection * -22 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <SearchPanel onNavigate={handleSearchNavigate} />
            </motion.div>
          </div>
        </div>
      </div>
      <PublishPanel
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        people={people}
        defaultPublisherId={selectedPerson?._id ?? ""}
        onVisit={handlePublishNavigate}
      />
    </main>
    </MotionConfig>
  );
}
