import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "build",
  trailingSlash: true,
  basePath: "/acampamentomiasma",
  assetPrefix: "/acampamentomiasma",
};

export default nextConfig;
