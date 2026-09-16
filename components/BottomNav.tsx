import Link from "next/link";

const ITENS = [{ href: "/", label: "Início", icone: "⌂" }, { href: "/categorias", label: "Categorias", icone: "▦" }, { href: "/favoritos", label: "Favoritos", icone: "♡" }, { href: "https://whatsapp.com/channel/0029VbDCazP2UPBJKKFNVo3J", label: "Canal", icone: "➤" }];

export default function BottomNav() { return <nav className="fixed inset-x-0 bottom-3 z-40 mx-auto flex w-[min(94%,520px)] justify-around rounded-2xl border border-[#f5b942]/25 bg-[#0d1b2d]/95 p-2 text-slate-300 shadow-2xl backdrop-blur md:hidden">{ITENS.map((item) => <Link key={item.label} href={item.href} className="flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs hover:bg-[#f5b942] hover:text-[#07111f]"><span className="text-xl">{item.icone}</span><span>{item.label}</span></Link>)}</nav>; }
