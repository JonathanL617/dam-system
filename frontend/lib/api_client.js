import axios from "axios";

const api = axios.create({
    baseURL: ProcessingInstruction.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});