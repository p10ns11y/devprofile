"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

type UseDialogFromSearchParamOptions = {
  /** Navigate here on close (e.g. `/certificates`). Otherwise strips `paramKey` from the current URL. */
  closePath?: string;
  lockBodyScroll?: boolean;
  /** When omitted, open iff the param is non-empty. Pass to require a valid id in your data. */
  isOpen?: (paramValue: string | null) => boolean;
};

/**
 * URL search param ↔ native `<dialog showModal()>`.
 * Do not mirror `open` in useState — derive `isOpen` from the param + your data.
 */
export function useDialogFromSearchParam(
  paramKey: string,
  options: UseDialogFromSearchParamOptions = {}
) {
  const { closePath, lockBodyScroll = true, isOpen: resolveIsOpen } = options;
  const searchParams = useSearchParams();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const paramValue = searchParams?.get(paramKey) ?? null;
  const isOpen = resolveIsOpen ? resolveIsOpen(paramValue) : paramValue !== null && paramValue !== "";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!lockBodyScroll || !isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, lockBodyScroll]);

  const open = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set(paramKey, value);
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [paramKey, router, searchParams]
  );

  const close = useCallback(() => {
    if (closePath) {
      router.replace(closePath, { scroll: false });
      return;
    }
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete(paramKey);
    const qs = params.toString();
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  }, [closePath, paramKey, router, searchParams]);

  return { dialogRef, paramValue, isOpen, open, close };
}
