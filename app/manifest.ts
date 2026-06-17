import type { MetadataRoute } from "next";

// Inlined to keep this metadata route outside the "server-only" lib/seo graph.
const SITE_NAME = "Umut Barış Terzioğlu";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Senior QA Engineer`,
    short_name: "UBT",
    description:
      "Portfolio of Umut Barış Terzioğlu — Senior Software QA Engineer in Dortmund, Germany.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F0",
    theme_color: "#1B7A6E",
    lang: "en",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
}
