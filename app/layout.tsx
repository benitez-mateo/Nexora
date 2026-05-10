import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter, JetBrains_Mono } from "next/font/google";
import { AuthGate } from "@/components/auth/AuthGate";
import { NavShell } from "@/components/workspace/NavShell";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { WorkspaceProvider } from "@/lib/workspace-context";
import "./globals.css";

const serif = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nexora Workspace",
    template: "%s · Nexora",
  },
  description:
    "Centro de datos colaborativo: procesamiento secuencial, chat de equipo y alertas de retraso.",
  applicationName: "Nexora Workspace",
  appleWebApp: {
    capable: true,
    title: "Nexora",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d12" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${serif.variable} ${mono.variable} ${sans.variable}`}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>
            <AuthGate>
              <WorkspaceProvider>
                <NavShell>{children}</NavShell>
              </WorkspaceProvider>
            </AuthGate>
          </AuthProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
