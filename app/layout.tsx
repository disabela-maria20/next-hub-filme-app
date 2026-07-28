import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProvider from "@/services/config/ClientProvider";

const openSans = Geist_Mono({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

import config from "@/data/config.json";
export const metadata: Metadata = config.seo;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientProvider>
      <html lang="pt-BR" className={`${openSans.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          {/* Data Layer */}
          <Script id="data-layer" strategy="beforeInteractive">
            {`
              window.dataLayer = [{
                page_title: "${config.seo.title}",
                property_title: "${config.seo.title}",
                content_type: "Microsite",
                site_country: "BR",
              }];
            `}
          </Script>

          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-CZYED2Y9QR"
            strategy="afterInteractive"
          />

          <Script id="gtag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-CZYED2Y9QR');
            `}
          </Script>

          {/* Google Tag Manager */}
          <Script id="gtm" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({
                  'gtm.start': new Date().getTime(),
                  event:'gtm.js'
                });
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),
                    dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-PGNMWRJZ');
            `}
          </Script>

          {/* LinkedIn Insight */}
          <Script id="linkedin" strategy="afterInteractive">
            {`
              _linkedin_partner_id = "8692145";
              window._linkedin_data_partner_ids =
                window._linkedin_data_partner_ids || [];
              window._linkedin_data_partner_ids.push(_linkedin_partner_id);

              (function(l){
                if(!l){
                  window.lintrk = function(a,b){
                    window.lintrk.q.push([a,b]);
                  };
                  window.lintrk.q = [];
                }
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";
                b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b,s);
              })(window.lintrk);
            `}
          </Script>

          {/* Meta Pixel */}
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !(function(f,b,e,v,n,t,s){
                if(f.fbq)return;
                n=f.fbq=function(){
                  n.callMethod
                    ? n.callMethod.apply(n,arguments)
                    : n.queue.push(arguments);
                };
                if(!f._fbq)f._fbq=n;
                n.push=n;
                n.loaded=!0;
                n.version='2.0';
                n.queue=[];
                t=b.createElement(e);
                t.async=!0;
                t.src=v;
                s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s);
              })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

              fbq('init','907050880863614');
              fbq('track','PageView');
            `}
          </Script>

          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-PGNMWRJZ"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>

          {/* LinkedIn (noscript) */}
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src="https://px.ads.linkedin.com/collect/?pid=8692145&fmt=gif"
            />
          </noscript>

          {/* Facebook Pixel (noscript) */}
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src="https://www.facebook.com/tr?id=907050880863614&ev=PageView&noscript=1"
            />
          </noscript>

          {children}
        </body>
      </html>
    </ClientProvider>
  );
}
