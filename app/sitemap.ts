import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tacsfon-oaustech.org";
  const routes = ["", "/about", "/events", "/units", "/gallery", "/contact"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/events" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route === "/events" ? 0.9 : 0.8,
  }));
}
