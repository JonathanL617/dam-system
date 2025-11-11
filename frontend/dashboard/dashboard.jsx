"use client"; 

import { useEEfect, useState } from "react";
import { Box, Heading, Text, Spinner, Grid, GridItem, Image, Tag} from "@chakra-ui/react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function DashboardPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/assets/`);
        if (!response.ok) throw new Error("Failed to fetch assets");
        const data = await response.json();
        setAssets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);
