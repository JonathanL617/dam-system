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

    return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bgGradient="linear(to-r, #74ebd5, #acb6e5)"
    >
      <VStack
        bg="white"
        p={10}
        borderRadius="2xl"
        boxShadow="lg"
        spacing={5}
        w="sm"
      >
        <Heading size="lg" color="#3498db">
          Digital Asset Management
        </Heading>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          colorScheme="blue"
          w="full"
          borderRadius="xl"
          onClick={handleLogin}
        >
          Login
        </Button>
      </VStack>
    </Box>
  );
}

 