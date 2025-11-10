import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Welcome to the DAM System</h1>
      <p>
        Use <Link href="/login">Login</Link> to continue.
      </p>
    </main>
  );
}