import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "build",
  trailingSlash: true,

  basePath: "/acampamentomiasma",
  assetPrefix: "/acampamentomiasma",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/acampamentomiasma",
        permanent: true, // ou false se for temporário
      },
    ];
  },
};

module.exports = nextConfig;
