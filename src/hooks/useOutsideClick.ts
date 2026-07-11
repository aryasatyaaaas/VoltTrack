import { useEffect, type RefObject } from "react";

/**
 * Closes a dropdown/popover when user clicks outside the ref element.
 * Replaces duplicate useEffect patterns for outside-click handling.
 */
export function useOutsideClick(
    ref: RefObject<HTMLElement | null>,
    enabled: boolean,
    onClose: () => void
): void {
    useEffect(() => {
        if (!enabled) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    // onClose is intentionally excluded — callers must pass stable refs (useCallback/setState setter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, ref]);
}
