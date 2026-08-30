// src/components/ui/SEO.jsx (Updated)
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import StructuredData from "./StructuredData";

export default function SEO({
  title,
  description,
  image = "/og-image.jpg",
  type = "website",
  keywords = [],
  noindex = false,
  structuredData = null,
}) {
  const location = useLocation();
  const siteUrl = window.location.origin;
  const currentUrl = `${siteUrl}${location.pathname}`;

  const defaultTitle = "ZAZA Store - MLBB Accounts Marketplace";
  const defaultDescription =
    "Buy and sell Mobile Legends accounts. Check player stats, explore heroes, and verify MLBB accounts securely.";
  const defaultImage = `${siteUrl}/og-image.jpg`;

  const finalTitle = title ? `${title} | ZAZA Store` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image?.startsWith("http") ? image : `${siteUrl}${image}`;
  const finalKeywords = [
    "ZAZA Store",
    "MLBB",
    "Mobile Legends",
    "Buy MLBB Account",
    "Sell MLBB Account",
    ...keywords,
  ].join(", ");

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    const updateMetaTag = (attr, value, key) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", value);
    };

    const updateOgTag = (property, content) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("property", property);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const updateTwitterTag = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("name", name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("name", finalDescription, "description");
    updateMetaTag("name", finalKeywords, "keywords");
    updateMetaTag(
      "name",
      "robots",
      noindex ? "noindex,nofollow" : "index,follow",
    );

    // Open Graph tags
    updateOgTag("og:title", finalTitle);
    updateOgTag("og:description", finalDescription);
    updateOgTag("og:image", finalImage);
    updateOgTag("og:url", currentUrl);
    updateOgTag("og:type", type);
    updateOgTag("og:site_name", "ZAZA Store");

    // Twitter Card tags
    updateTwitterTag("twitter:card", "summary_large_image");
    updateTwitterTag("twitter:title", finalTitle);
    updateTwitterTag("twitter:description", finalDescription);
    updateTwitterTag("twitter:image", finalImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);
  }, [
    finalTitle,
    finalDescription,
    finalImage,
    currentUrl,
    type,
    finalKeywords,
    noindex,
  ]);

  return <StructuredData data={structuredData} />;
}
