/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useDataLayer.ts
import { useEffect, useRef } from "react";
import config from "@/data/config.json";

interface DataLayerEvent {
  event: string;
  event_category?: string;
  event_action?: string;
  event_label?: string;
  [key: string]: any;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const useDataLayer = () => {
  const dataLayerRef = useRef<Window["dataLayer"] | undefined>(undefined);

  useEffect(() => {
    // Inicializa o dataLayer se não existir
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      dataLayerRef.current = window.dataLayer;
    }
  }, []);

  const pushEvent = (event: DataLayerEvent) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push(event);
    }
  };

  const pushPageView = (pageTitle: string, pageUrl?: string) => {
    pushEvent({
      event: "pageview",
      page_title: pageTitle,
      page_url: pageUrl || window.location.href,
    });
  };

  const pushTicketingEvent = (
    action: "date" | "time" | "city" | "theater select",
    label: string,
    additionalData?: Record<string, any>,
  ) => {
    pushEvent({
      event: action,
      event_category: "Ticketing Event",
      event_action: action,
      event_label: label,
      page_title: `${config.seo.title || "Filme"} Ticketing`,
      property_title: config.seo.title || "Filme",
      content_type: "microsite",
      site_country: "BR",
      ...additionalData,
    });
  };

  return {
    pushEvent,
    pushPageView,
    pushTicketingEvent,
  };
};
