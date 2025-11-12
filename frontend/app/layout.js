'use client';

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@chakra-ui/react/preset";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider value={system}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}