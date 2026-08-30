// src/components/ui/StructuredData.jsx
import { useEffect } from "react";

export default function StructuredData({ data }) {
  useEffect(() => {
    if (!data) return;

    // Remove existing JSON-LD
    const existingScript = document.querySelector('script[data-seo="jsonld"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new JSON-LD
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("data-seo", "jsonld");
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector(
        'script[data-seo="jsonld"]',
      );
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
}
