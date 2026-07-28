import Home from "@/views/home";
import type { Metadata } from "next";
import config from "@/data/config.json";
export const metadata: Metadata = config.seo;

export default function PageHome() {
  return <Home />;
}
