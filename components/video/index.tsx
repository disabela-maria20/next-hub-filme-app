"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import config from "@/data/config.json";
export default function Video() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="relative w-full aspect-video">
      {!clicked ? (
        <img
          src={config.video.img}
          alt="Preview do Trailer"
          onClick={() => setClicked(true)}
          className="absolute inset-0 h-full w-full cursor-pointer rounded-xl object-cover"
        />
      ) : (
        <iframe
          className="absolute inset-0 h-full w-full rounded-xl"
          src={config.video.url}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}
