"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, UserRound } from "lucide-react";
import type { Person } from "@/types/api";

interface PersonDropdownProps {
  people: Person[];
  selectedPerson: Person | null;
  loading: boolean;
  onChange: (personId: string) => void;
}

export default function PersonDropdown({ people, selectedPerson, loading, onChange }: PersonDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  function focusOption(index: number) {
    const options = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    if (!options?.length) return;
    options[Math.max(0, Math.min(index, options.length - 1))]?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusOption(Math.max(0, people.findIndex((person) => person._id === selectedPerson?._id))));
    }
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index === 0) triggerRef.current?.focus();
      else focusOption(index - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={selectedPerson ? `Browsing as ${selectedPerson.name}` : "Choose a visitor"}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={loading || people.length === 0}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleTriggerKeyDown}
        className="flex h-11 min-w-52 items-center gap-2 rounded-full border border-[#e2ded5] bg-white px-3.5 text-sm text-[#3b4640] shadow-[0_2px_8px_-5px_rgba(31,42,36,0.5)] outline-none transition hover:border-[#c9c2b6] focus-visible:ring-4 focus-visible:ring-[#e3ebe5] disabled:cursor-wait disabled:opacity-70 sm:min-w-60"
      >
        <UserRound size={15} className="shrink-0 text-[#55766b]" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedPerson ? (
            <>
              <span className="mr-1 text-xs text-[#858c85]">Browsing as</span>
              <span className="font-medium text-[#25352e]">{selectedPerson.name}</span>
            </>
          ) : (
            <span className="font-medium text-[#25352e]">Choose a visitor</span>
          )}
        </span>
        <ChevronDown size={15} className={`shrink-0 text-[#78837c] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && people.length > 0 && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Choose who is browsing"
          className="absolute right-0 z-40 mt-2 w-full min-w-60 overflow-hidden rounded-2xl border border-[#e2ded5] bg-white p-1.5 shadow-[0_18px_50px_-18px_rgba(27,36,31,0.28)]"
        >
          <p className="px-3 pb-1.5 pt-2 text-[10px] font-medium uppercase tracking-[0.17em] text-[#899089]">Choose a visitor</p>
          {people.map((person, index) => {
            const selected = person._id === selectedPerson?._id;
            return (
              <button
                key={person._id}
                type="button"
                role="option"
                aria-selected={selected}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                onClick={() => {
                  onChange(person._id);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${selected ? "bg-[#eef3ee] text-[#173f35]" : "text-[#424b45] hover:bg-[#f7f6f2]"}`}
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e8eee8] font-display text-sm text-[#386458]">
                  {person.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate">{person.name}</span>
                {selected && <Check size={15} className="shrink-0 text-[#276452]" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
