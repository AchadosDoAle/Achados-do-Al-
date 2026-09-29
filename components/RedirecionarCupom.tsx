"use client";

import { useEffect } from "react";

export default function RedirecionarCupom({ destino }: { destino: string }) {
  useEffect(() => {
    if (!/^https?:\/\//i.test(destino)) return;
    const timer = window.setTimeout(() => {
      window.location.replace(destino);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [destino]);

  return null;
}
