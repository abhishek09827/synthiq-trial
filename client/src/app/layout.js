"use client";
import { ChakraProvider } from "@chakra-ui/react";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import AuthGuard from "@/components/AuthGuard"; // For guarding the main page
import LoginPage from "./LoginPage/LoginPage"; // Import the LoginPage
import Home from "./page"; // Import your dashboard page

export default function RootLayout() {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <BrowserRouter>
            <Refine routerProvider={routerProvider}>
              <Routes>
                {/* Public route for login */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Private route for dashboard, protected by AuthGuard */}
                <Route 
                  path="/" 
                  element={
                    <AuthGuard>
                      <Home /> {/* Render the dashboard page here */}
                    </AuthGuard>
                  } 
                />
                
                {/* Redirect all unknown routes to login page */}
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Refine>
          </BrowserRouter>
        </ChakraProvider>
      </body>
    </html>
  );
}
