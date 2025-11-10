"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Input, Vstack, Heading, useToast } from "@chakra-ui/react";
import { login } from "@/lib/api_client";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [passwordInputAnatomy, setPassword] = useState("");
    const router = useRouter();
    const toast = useToast();
}

  const handleLogin = async () => {
    try {
      const res = await login(username, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast({
        title: "Login successful",
        description: `Welcome, ${res.user.username}!`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // Redirect based on role
      if (res.user.role === "Admin") router.push("/admin");
      else router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your username or password.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
 