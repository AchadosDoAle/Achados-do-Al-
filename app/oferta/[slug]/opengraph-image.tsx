import { ImageResponse } from "next/og";
import { criarClientePublico } from "@/lib/supabase/public";
import { buscarOfertaPorSlug } from "@/lib/offers-repo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function dinheiro(v?: number) { return v == null ? "Confira o preço" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default async function Image({ params }: { params: { slug: string } }) {
  const oferta = await buscarOfertaPorSlug(criarClientePublico(), params.slug);
  if (!oferta) return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",background:"#07111F",color:"white",alignItems:"center",justifyContent:"center",fontSize:64}}>Achado do Alê</div>, size);
  const preco = oferta.precoPix ?? oferta.precoAtual;
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",background:"#07111F",color:"#F8FAFC",padding:48,fontFamily:"sans-serif"}}>
      <div style={{width:"46%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"white",borderRadius:32,overflow:"hidden"}}>
        {oferta.imagemPrincipal ? <img src={oferta.imagemPrincipal} width="520" height="520" style={{objectFit:"contain"}} /> : <div style={{fontSize:120}}>🛍️</div>}
      </div>
      <div style={{width:"54%",paddingLeft:48,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{fontSize:28,color:"#F5B942",fontWeight:800}}>ACHADO DO ALÊ · {oferta.loja}</div>
        <div style={{fontSize:44,fontWeight:800,lineHeight:1.08,marginTop:18}}>{oferta.titulo}</div>
        {oferta.precoAntigo ? <div style={{fontSize:28,color:"#A8B5C5",marginTop:26,textDecoration:"line-through"}}>{dinheiro(oferta.precoAntigo)}</div> : null}
        <div style={{fontSize:58,color:oferta.precoPix ? "#2FBF8F" : "#F5B942",fontWeight:900,marginTop:8}}>{dinheiro(preco)}</div>
        {oferta.precoPix ? <div style={{fontSize:24,color:"#2FBF8F",fontWeight:700}}>NO PIX</div> : null}
        {oferta.cupom ? <div style={{marginTop:24,fontSize:24,padding:"10px 16px",border:"2px dashed #F5B942",borderRadius:14,color:"#FFD66B",alignSelf:"flex-start"}}>CUPOM: {oferta.cupom}</div> : null}
      </div>
    </div>,
    size
  );
}
