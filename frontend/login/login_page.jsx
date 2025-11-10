"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Input, Vstack, Heading, useToast } from "@chakra-ui/react";
import { login } from "@/lib/api_client";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    conmst [passwordInputAnatomy, setPassword] = useState("");
    const router = useRouter();
    const toast = useToast();
}