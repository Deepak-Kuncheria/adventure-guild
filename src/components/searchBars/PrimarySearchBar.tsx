"use client";
import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

const PrimarySearchBar = () => {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounceQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debounceQuery.trim() === "") {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const fetchSuggestions = async (controller: AbortController) => {
      try {
        const resp = await fetch(`/api/autocomplete/title/${debounceQuery}`, {
          signal: controller.signal,
        });
        if (!resp.ok) {
          setSuggestions([]);
          return;
        }
        const body = await resp.json();

        if (body.data) {
          setSuggestions([...body?.data]);
        }
      } catch {
        setSuggestions([]);
      }
    };
    fetchSuggestions(controller);
    return () => controller.abort();
  }, [debounceQuery]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ctrlKey for Windows/Linux, metaKey for macOS
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isCmdK = isMac
        ? e.metaKey && e.key === "k"
        : e.ctrlKey && e.key === "k";

      if (isCmdK) {
        e.preventDefault();
        ref.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() !== "") {
      router.push(`/search?query=${query}`);
    }
  };
  useEffect(() => {
    console.log(suggestions);
  }, [suggestions]);
  return (
    <>
      <form onSubmit={handleSubmit} role="search form">
        <input
          ref={ref}
          name="q"
          type="search"
          placeholder="Search"
          className="searchBar text-foreground"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="search books, volumes or chapters"
        />
      </form>
    </>
  );
};

export default PrimarySearchBar;
