export const metadata = {
  title: 'Lo Shu Numerology | Feng Shui Analysis 2026',
  description: 'Classical Feng Shui, Lo Shu numerology and Flying Stars analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
