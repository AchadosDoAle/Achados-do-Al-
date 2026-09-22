"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export default function GoogleAnalytics({
  measurementId,
}: {
  measurementId: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!measurementId || !window.gtag) return;

    window.gtag("event", "page_view", {
      page_path: `${window.location.pathname}${window.location.search}`,
      page_location: window.location.href,
    });
  }, [measurementId, pathname]);

  return null;
}
