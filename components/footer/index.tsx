"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import config from "@/data/config.json";

const logos = [
  config.rodape.bb,
  config.rodape.bb,
  config.rodape.bb,
  config.rodape.bb,
];

export default function Footer() {
  const [showAccessibility, setShowAccessibility] = useState(false);

  return (
    <footer className="relative w-full text-white">
      {/* Painel de acessibilidade */}
      <div
        className={`absolute bottom-full left-1/2 z-50 w-[95%] max-w-5xl -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${showAccessibility
          ? "translate-y-0 opacity-100 visible"
          : "translate-y-6 opacity-0 invisible"
          }`}
      >
        <div className="rounded-3xl border border-primary/20 bg-[#111317]/95 p-6 shadow-2xl backdrop-blur-xl">
          <p className="text-center text-[13px] leading-7 uppercase tracking-wide text-gray-300">
            A exibição deste filme conta com suporte do aplicativo{" "}
            <span className="font-bold text-white">MOVIE READING</span>,
            desenvolvido para proporcionar acessibilidade completa,
            disponibilizando os recursos de{" "}
            <span className="text-primary">
              Audiodescrição, Legendas e LIBRAS
            </span>{" "}
            - Língua Brasileira de Sinais.
            <br />
            <a
              href="https://www.moviereadingbrasil.com.br/#home"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-primary transition-all duration-300 hover:scale-105 hover:text-primary-dark"
            >
              Saiba mais →
            </a>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-5 md:flex-row">
        <p className="text-center text-[14px] md:text-left">
          {config.rodape.copy}
        </p>

        {/* Mobile */}
        {/* <div className="w-full overflow-hidden md:hidden">
          <div className="flex w-max animate-marquee">
            {[...logos, ...logos].map((logo, index) => (
              <img
                key={index}
                src={logo}
                alt="Logo"
                className="h-32 flex-shrink-0 transition-transform duration-300 hover:scale-110"
              />
            ))}
          </div>
        </div> */}

        {/* Desktop */}
        <img
          src={config.rodape.bb}
          alt="Logo"
          className="w-1/2 md:w-[400px]"
        />

        <button
          onClick={() => setShowAccessibility(!showAccessibility)}
          className="group flex cursor-pointer items-center gap-2 rounded-xl border border-primary bg-transparent px-5 py-2 font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-white"
        >
          <span className="text-[14px]">Acessibilidade</span>

          <svg
            className={`h-5 w-5 transition-transform duration-500 ${showAccessibility ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </footer>
  );
}
