import React, { useEffect, useRef } from "react";

export function SearchBox({
    query,
    setQuery,
    placeholder,
    autoFocus = true,
}: {
    query?: string;
    setQuery: (query: string) => void;
    placeholder: string;
    autoFocus?: boolean;
}) {
    const searchRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (autoFocus) {
            searchRef.current?.focus();
        }
    }, [searchRef, autoFocus]);

    return (
        <input
            className="font-text w-full rounded-md bg-stone-100 px-3 py-1.5 font-medium leading-none placeholder-neutral-400 outline-none dark:bg-neutral-800 dark:placeholder-neutral-500"
            spellCheck="false"
            autoFocus={autoFocus}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={searchRef}
        />
    );
}
