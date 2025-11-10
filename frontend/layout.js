'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import store from '../store/store';
import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <ChakraProvider>
            {children}
          </ChakraProvider>
        </Provider>
      </body>
    </html>
  );
}
