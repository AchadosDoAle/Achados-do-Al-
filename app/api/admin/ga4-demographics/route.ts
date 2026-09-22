import { NextRequest, NextResponse } from "next/server";
import { createSign } from "crypto";
import { criarClienteServidor } from "@/lib/supabase/server";
import { usuarioEhAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

function base64Url(valor: string | Buffer) {
  return Buffer.from(valor)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function obterAccessToken(clientEmail: string, privateKey: string) {
  const agora = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: agora,
      exp: agora + 3600,
    })
  );
  const unsigned = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const signature = sign.sign(privateKey);
  const assertion = `${unsigned}.${base64Url(signature)}`;

  const resposta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao autenticar no Google (${resposta.status})`);
  }

  const dados = (await resposta.json()) as { access_token?: string };
  if (!dados.access_token) throw new Error("Google não retornou access token");
  return dados.access_token;
}

function inicioGa4(periodo: string) {
  if (periodo === "24h") return "1daysAgo";
  if (periodo === "30d") return "30daysAgo";
  if (periodo === "todos") return "3650daysAgo";
  return "7daysAgo";
}

async function consultarDimensao(
  propertyId: string,
  accessToken: string,
  dimension: "userAgeBracket" | "userGender",
  periodo: string
) {
  const resposta = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: inicioGa4(periodo), endDate: "today" }],
        dimensions: [{ name: dimension }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: "20",
      }),
      cache: "no-store",
    }
  );

  if (!resposta.ok) {
    const detalhe = await resposta.text();
    throw new Error(`GA4 ${dimension}: ${resposta.status} ${detalhe.slice(0, 300)}`);
  }

  const dados = (await resposta.json()) as {
    rows?: Array<{
      dimensionValues?: Array<{ value?: string }>;
      metricValues?: Array<{ value?: string }>;
    }>;
  };

  return (dados.rows ?? []).map((row) => ({
    label: row.dimensionValues?.[0]?.value || "Desconhecido",
    users: Number(row.metricValues?.[0]?.value || 0),
  }));
}

export async function GET(req: NextRequest) {
  if (!(await usuarioEhAdmin())) return NextResponse.json({ configured: false, error: "Não autorizado", age: [], gender: [] }, { status: 401 });
  const supabase = criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GA4_PRIVATE_KEY;

  if (!propertyId || !clientEmail || !privateKeyRaw) {
    return NextResponse.json({ configured: false, age: [], gender: [] });
  }

  try {
    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
    const token = await obterAccessToken(clientEmail, privateKey);
    const periodo = req.nextUrl.searchParams.get("periodo") || "7d";
    const [age, gender] = await Promise.all([
      consultarDimensao(propertyId, token, "userAgeBracket", periodo),
      consultarDimensao(propertyId, token, "userGender", periodo),
    ]);

    return NextResponse.json({ configured: true, age, gender });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json(
      {
        configured: true,
        age: [],
        gender: [],
        error: erro instanceof Error ? erro.message : "Falha ao consultar GA4",
      },
      { status: 502 }
    );
  }
}
