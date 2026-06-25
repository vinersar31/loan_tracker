"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Landmark } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-sm animate-fade-in-up p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-2 shadow-glow">
          <Landmark className="h-7 w-7 text-white" strokeWidth={2.2} />
        </div>
        <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-main">
          Mortgage Tracker
        </h1>
        <p className="mt-1 text-center text-sm text-secondary">
          Sign in to track your loan.
        </p>

        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
