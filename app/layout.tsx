import type { Metadata } from "next";
import "./base.css";
import "./oriental.css";
import "./globals.css";
import "./footer.css";
export const metadata: Metadata = {
  title: "China Fu · El antojo tiene nombre",
  description:
    "Descubre la carta de China Fu, elige tu local y arma tu pedido.",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
