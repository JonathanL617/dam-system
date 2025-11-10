"Use client";
import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";
import store from "../lib/store";

export default function RootLayout({ childern }) {
  return (
    <html lang="en">
      <body>
        <Provider store = {store}>
          <ChakraProvider>
            {children}
          </ChakraProvider>
        </Provider>
      </body>
    </html>
  );
}