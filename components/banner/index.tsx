"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import useIsMobile from "@/hook/useIsMobile/isMobile";
import config from "@/data/config.json";

interface BannerProps {
  height?: number;
  onWidthChange: (width: number) => void;
}

export default function Banner({ height, onWidthChange }: BannerProps) {
  const { isMobile } = useIsMobile();

  const banner = isMobile ? config.banner.mobile : config.banner.desktop;

  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!height) return;

    const img = new Image();

    img.src = banner;

    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      const newWidth = height * ratio;

      setWidth(newWidth);
      onWidthChange(newWidth);
    };
  }, [banner, height, onWidthChange]);

  return (
    <img
      src={banner}
      alt="Poster"
      className="rounded-2xl"
      style={{
        height: height ?? "auto",
        width: height ? width : "100%",
        maxWidth: "100%",
        objectFit: "contain",
        display: "block",

        flexShrink: 0,
      }}
    />
  );
}
