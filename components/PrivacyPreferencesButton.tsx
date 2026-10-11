"use client";

export default function PrivacyPreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("achado:abrir-privacidade"))}
      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-text hover:border-gold/40 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      Alterar preferências de privacidade
    </button>
  );
}
