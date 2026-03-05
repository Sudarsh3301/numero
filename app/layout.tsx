import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: 'Numerology Patterns',
  description: 'Classical  numerology and Flying Stars analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
