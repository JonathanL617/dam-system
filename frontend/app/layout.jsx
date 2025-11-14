import "./globals.css";

export const metadata = {
  title: "DAM System",
  description: "Digital Asset Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
