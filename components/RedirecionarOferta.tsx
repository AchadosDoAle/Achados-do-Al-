"use client";

import { useEffect } from "react";

export default function RedirecionarOferta({ destino }: { destino: string }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.replace(destino);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [destino]);

  return null;
}
