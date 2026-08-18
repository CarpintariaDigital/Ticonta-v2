"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PWAManifestManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Determine appropriate manifest based on active route
    let manifestUrl = "/manifest.json";
    if (pathname?.startsWith("/pos")) {
      manifestUrl = "/pos/manifest.json";
    } else if (pathname?.startsWith("/informal-sales")) {
      manifestUrl = "/informal/manifest.json";
    }

    // Update or create <link rel="manifest">
    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (manifestLink) {
      if (manifestLink.getAttribute("href") !== manifestUrl) {
        manifestLink.setAttribute("href", manifestUrl);
      }
    } else {
      manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      manifestLink.href = manifestUrl;
      document.head.appendChild(manifestLink);
    }

    // Register Service Worker if supported
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Notify service worker of current module for selective caching
          if (registration.active) {
            registration.active.postMessage({
              type: "ROUTE_ACTIVE",
              pathname: pathname || "/",
            });
          }
        })
        .catch((err) => {
          console.debug("ServiceWorker registration skipped or failed:", err);
        });
    }
  }, [pathname]);

  return null;
}
