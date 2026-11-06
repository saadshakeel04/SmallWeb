"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Site } from "@/types/api";

interface SiteFrameProps {
  site: Site;
  onNavigate: (address: string) => void;
}

function getInternalAddress(href: string | null): string | null {
  if (!href) return null;
  const match = /^(?:(?:https?):\/\/)?([a-z0-9]+(?:-[a-z0-9]+)*\.zz)\/?$/i.exec(href.trim());
  return match?.[1].toLowerCase() ?? null;
}

export default function SiteFrame({ site, onNavigate }: SiteFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const listenerRef = useRef<{
    document: Document;
    handler: (event: MouseEvent) => void;
  } | null>(null);

  const srcDoc = useMemo(
    () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'">
  <style>body{margin:0;padding:1rem 1.25rem;color:#34473f;font:16px/1.8 Arial,Helvetica,sans-serif;overflow-wrap:anywhere}h1,h2,h3,h4{color:#203b32;line-height:1.25}a{color:#2d7057;text-underline-offset:3px}main{max-width:48rem;margin:0 auto}</style>
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
    }

    const handler = (event: MouseEvent) => {
      const target = event.target;
      const anchor = target instanceof frameWindow.Element ? target.closest("a") : null;
      if (!anchor) return;

      event.preventDefault();
      event.stopPropagation();
      const address = getInternalAddress(anchor.getAttribute("href"));
      if (address) onNavigate(address);
    };

    frameDocument.addEventListener("click", handler, true);
    listenerRef.current = { document: frameDocument, handler };
  }

  useEffect(
    () => () => {
      if (listenerRef.current) {
        listenerRef.current.document.removeEventListener(
          "click",
          listenerRef.current.handler,
          true,
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
      className="block h-[38rem] w-full rounded-xl border border-[#e2eae5] bg-white"
      referrerPolicy="no-referrer"
    />
  );
}
