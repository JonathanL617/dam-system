import Header from '@/components/header';

export default function RootLayout({ children }) {
  return children
  return (
    <html lang="en">
      <head>
        <title>DAM System</title>
      </head>
      <body suppressHydrationWarning={true}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
