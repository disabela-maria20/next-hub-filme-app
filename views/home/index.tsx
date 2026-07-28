"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { Banner, Footer, Sessions, Video } from "@/components";
import useIsMobile from "@/hook/useIsMobile/isMobile";

export default function Home() {
  const { isMobile } = useIsMobile();

  const footerRef = useRef<HTMLElement>(null);

  const [bannerWidth, setBannerWidth] = useState(300);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      const footerHeight = footerRef.current?.offsetHeight ?? 0;

      if (isMobile) {
        setContentHeight(0);
      } else {
        setContentHeight(window.innerHeight - footerHeight);
      }
    };

    update();

    const resize = new ResizeObserver(update);

    if (footerRef.current) {
      resize.observe(footerRef.current);
    }

    window.addEventListener("resize", update);

    return () => {
      resize.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [isMobile]);

  return (
    <main
      className={`bg-black ${isMobile ? "overflow-y-auto" : "overflow-hidden"}`}
    >
      <div className="bg-background-primary rounded-2xl">
        <section
          className={`flex ${isMobile ? "flex-col" : ""} gap-10`}
          style={{
            height: isMobile ? "auto" : contentHeight,
            minHeight: isMobile ? "100vh" : undefined,
          }}
        >
          <Banner
            height={isMobile ? undefined : contentHeight}
            onWidthChange={setBannerWidth}
          />

          <div
            className="flex-1 md:py-8 px-3 md:pl-12 md:pr-12 h-full overflow-auto"
            style={{
              width: isMobile ? "100%" : `calc(100% - ${bannerWidth}px)`,
              minHeight: isMobile ? 400 : contentHeight,
            }}
          >
            <div className="text-white">
              <h1 className="text-2xl font-bold md:text-3xl pb-3">
                Encontre sessões perto de você
              </h1>
              <p className="pb-6 text-gray-300">
                Consulte abaixo as sessões disponíveis no cinema mais próximo de
                você.
              </p>
              <div className="h-px bg-border-primary" />

              <Sessions />
            </div>
          </div>
        </section>

        <footer ref={footerRef} className=" p-4">
          <Footer />
        </footer>
      </div>
    </main>
  );
}
