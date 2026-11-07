"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Site } from "@/types/api";

interface SiteFrameProps {
  entryId: string;
  site: Site;
  initialScrollY: number;
  onNavigate: (address: string) => void;
  onScroll: (entryId: string, scrollY: number) => void;
}

function getInternalAddress(href: string | null): string | null {
  if (!href) return null;
  const match = /^(?:(?:https?):\/\/)?([a-z0-9]+(?:-[a-z0-9]+)*\.zz)\/?$/i.exec(href.trim());
  return match?.[1].toLowerCase() ?? null;
}

export default function SiteFrame({
  entryId,
  site,
  initialScrollY,
  onNavigate,
  onScroll,
}: SiteFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const listenerRef = useRef<{
    document: Document;
    window: Window;
    handler: (event: MouseEvent) => void;
    scrollHandler: () => void;
  } | null>(null);
  const callbacksRef = useRef({ onNavigate, onScroll });

  useEffect(() => {
    callbacksRef.current = { onNavigate, onScroll };
  }, [onNavigate, onScroll]);

  const srcDoc = useMemo(
    () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'">
  <style>html{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;width:0;height:0}body{margin:0;padding:1.5rem 1.75rem;color:#353a36;font:16px/1.8 Arial,Helvetica,sans-serif;overflow-wrap:anywhere}h1,h2,h3,h4{color:#1b2924;font-family:Georgia,'Times New Roman',serif;font-weight:400;line-height:1.18}a{color:#0f5a4c;text-underline-offset:4px}main{max-width:48rem;margin:0 auto}</style>
</head>
<body>${site.html}</body>
</html>`,
    [site.html],
  );

  function handleLoad() {
    const frameDocument = frameRef.current?.contentDocument;
    const frameWindow = frameDocument?.defaultView;
    if (!frameDocument || !frameWindow) return;

    if (listenerRef.current) {
      listenerRef.current.document.removeEventListener(
        "click",
        listenerRef.current.handler,
        true,
      );
      listenerRef.current.window.removeEventListener(
        "scroll",
        listenerRef.current.scrollHandler,
      );
    }

    const handler = (event: MouseEvent) => {
      const target = event.target;
      const anchor = target instanceof frameWindow.Element ? target.closest("a") : null;
      if (!anchor) return;

      event.preventDefault();
      event.stopPropagation();
      const address = getInternalAddress(anchor.getAttribute("href"));
      callbacksRef.current.onScroll(entryId, Math.round(frameWindow.scrollY));
      if (address) callbacksRef.current.onNavigate(address);
    };

    const scrollHandler = () => {
      callbacksRef.current.onScroll(entryId, Math.round(frameWindow.scrollY));
    };

    frameDocument.addEventListener("click", handler, true);
    frameWindow.addEventListener("scroll", scrollHandler, { passive: true });
    listenerRef.current = {
      document: frameDocument,
      window: frameWindow,
      handler,
      scrollHandler,
    };
    frameWindow.requestAnimationFrame(() => {
      frameWindow.scrollTo(0, initialScrollY);
      scrollHandler();
    });
  }

  useEffect(
    () => () => {
      if (listenerRef.current) {
        listenerRef.current.document.removeEventListener(
          "click",
          listenerRef.current.handler,
          true,
        );
        listenerRef.current.window.removeEventListener(
          "scroll",
          listenerRef.current.scrollHandler,
        );
      }
    },
    [],
  );

  return (
    <iframe
      ref={frameRef}
      title={`${site.title} — ${site.address}`}
      srcDoc={srcDoc}
      sandbox="allow-same-origin"
      onLoad={handleLoad}
      className="block h-[68vh] min-h-[32rem] max-h-[48rem] w-full rounded-2xl border border-[#e2ded5] bg-white"
      referrerPolicy="no-referrer"
    />
  );
}
