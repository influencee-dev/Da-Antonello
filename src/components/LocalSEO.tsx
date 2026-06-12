import { useEffect } from "react";
import { RESTAURANT_INFO } from "../data";

export default function LocalSEO() {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Pizzeria",
      "name": RESTAURANT_INFO.name,
      "alternateName": RESTAURANT_INFO.brand,
      "image": [
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000",
        "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=1000",
        "https://images.unsplash.com/photo-1555075182-7c5132d22904?q=80&w=1000"
      ],
      "@id": "https://da-antonello-foggia.it/#restaurant",
      "url": "https://da-antonello-foggia.it",
      "telephone": RESTAURANT_INFO.phone,
      "priceRange": "$$",
      "menu": "https://da-antonello-foggia.it/#menu",
      "servesCuisine": [
        "Pizza",
        "Pizza al Metro",
        "Panzerotti",
        "Cucina Pugliese",
        "Cucina Italiana"
      ],
      "acceptsReservations": "True",
      "paymentAccepted": "Cash, Credit Card, PayPal, POS",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": RESTAURANT_INFO.address,
        "addressLocality": RESTAURANT_INFO.city,
        "postalCode": RESTAURANT_INFO.postalCode,
        "addressRegion": "FG",
        "addressCountry": "IT"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 41.458925,
        "longitude": 15.548777
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "19:00",
          "closes": "23:30"
        }
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": RESTAURANT_INFO.phone,
        "contactType": "reservations",
        "availableLanguage": ["Italian"]
      }
    };

    const existingScript = document.getElementById("local-seo-schema");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "local-seo-schema";
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const addedScript = document.getElementById("local-seo-schema");
      if (addedScript) {
        addedScript.remove();
      }
    };
  }, []);

  return null;
}
