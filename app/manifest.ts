import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Achado do Alê",
    short_name: "Achado do Alê",
    description: "Ofertas, cupons e achadinhos selecionados.",
    start_url: "/",
    display: "standalone",
    background_color: "#07111F",
    theme_color: "#07111F",
    // Permite a verificação de app instalado em navegadores compatíveis,
    // somente após o app Android declarar o vínculo com este site.
    related_applications: [
      {
        platform: "play",
        id: "com.achadodoale.app",
        url: "https://play.google.com/store/apps/details?id=com.achadodoale.app",
      },
    ],
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
