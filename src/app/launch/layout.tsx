export const metadata = {
  title: 'Harch Corp — Interactive Launch',
  description: 'Scroll-driven interactive presentation.',
};

export default function LaunchLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#000', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
