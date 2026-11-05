-- A classificação 18+ passa a ser exclusivamente manual.
-- Remove o gatilho anterior, que podia marcar produtos comuns por coincidência
-- de texto (por exemplo, a sequência "gin" dentro da palavra "original").
drop trigger if exists trg_classificar_bebida_alcoolica on public.offers;
drop function if exists public.classificar_bebida_alcoolica();

-- Não altera os valores já salvos: o administrador pode revisar/desmarcar
-- cada oferta no formulário, e o valor false passa a ser respeitado.
