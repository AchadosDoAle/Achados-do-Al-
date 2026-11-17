"use client";

import { useState } from "react";

const DOMINIOS: Record<string, string> = {
  adidas: "adidas.com",
  aliexpress: "aliexpress.com",
  amazon: "amazon.com.br",
  arno: "arno.com.br",
  avon: "avon.com.br",
  baw: "bawclothing.com.br",
  "baw clothing": "bawclothing.com.br",
  "c&a": "cea.com.br",
  dafiti: "dafiti.com.br",
  drogal: "drogal.com.br",
  "fut fanatics": "futfanatics.com.br",
  intimissimi: "intimissimi.com",
  "kabum!": "kabum.com.br",
  "loja nba": "store.nba.com",
  "nba store": "store.nba.com",
  "l’oreal": "loreal.com.br",
  "l'oreal": "loreal.com.br",
  loreal: "loreal.com.br",
  "magalu - magazine luiza": "magazineluiza.com.br",
  magalu: "magazineluiza.com.br",
  "magazine luiza": "magazineluiza.com.br",
  "mercado livre": "mercadolivre.com.br",
  mercadolivre: "mercadolivre.com.br",
  natura: "natura.com.br",
  netshoes: "netshoes.com.br",
  nike: "nike.com",
  samsung: "samsung.com",
  sephora: "sephora.com.br",
  shopee: "shopee.com.br",
  shoptimão: "shop.timao.com.br",
  shoptimao: "shop.timao.com.br",
  stanley: "stanley1913.com",
  "zz mall": "zzmall.com.br",
  zzmall: "zzmall.com.br",
};

function chaveLoja(nome: string) {
  return nome.trim().toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function LogoLojaCupom({ loja }: { loja: string }) {
  const chave = chaveLoja(loja);
  const dominio = DOMINIOS[chave] ?? DOMINIOS[chave.replace(/\s+/g, " ")];
  const [falhou, setFalhou] = useState(false);
  const iniciais = loja.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toLocaleUpperCase("pt-BR");

  if (!dominio || falhou) {
    return <span className="coupon-brand-fallback" aria-label={`Logo de ${loja}`}>{iniciais}</span>;
  }

  return (
    <span className="coupon-brand-logo">
      <img
        src={`https://www.google.com/s2/favicons?domain=${dominio}&sz=128`}
        alt={`Logo ${loja}`}
        loading="lazy"
        decoding="async"
        onError={() => setFalhou(true)}
      />
    </span>
  );
}
