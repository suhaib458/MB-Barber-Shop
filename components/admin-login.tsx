"use client";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ArrowLeft, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/logo";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
export function AdminLogin() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    router = useRouter();
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError("");
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      const response = await fetch("/api/admin/session", {
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!response.ok) {
        await signOut(auth);
        setError(
          response.status === 403
            ? "This Firebase account is not authorized as an active MB admin."
            : "Unable to verify the Admin session.",
        );
        return;
      }
      router.replace("/admin");
    } catch {
      setError("Unable to sign in. Check your admin credentials.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main
      dir="ltr"
      className="relative grid min-h-screen place-items-center overflow-hidden bg-[#080808] p-5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(198,161,91,.14),transparent_35%)]" />
      <Link
        href="/ar"
        className="absolute left-6 top-6 flex items-center gap-2 text-xs text-white/45 hover:text-white"
      >
        <ArrowLeft size={15} />
        Back to website
      </Link>
      <section className="relative w-full max-w-md rounded-[30px] border border-white/10 bg-white/[.035] p-7 shadow-2xl backdrop-blur md:p-10">
        <Logo />
        <div className="mt-10 flex items-center gap-3">
          <LockKeyhole className="text-[#c6a15b]" />
          <div>
            <h1 className="text-2xl font-medium">Admin access</h1>
            <p className="mt-1 text-xs text-white/40">
              Protected with Firebase Authentication
            </p>
          </div>
        </div>
        {!isFirebaseConfigured ? (
          <div className="mt-8 rounded-2xl border border-amber-300/15 bg-amber-300/[.06] p-4 text-sm leading-6 text-amber-100/75">
            Firebase is not configured yet. Add the variables from{" "}
            <code>.env.example</code>, enable Email/Password Authentication,
            then create the first admin.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block text-xs text-white/50">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-white outline-none focus:border-[#c6a15b]"
              />
            </label>
            <label className="block text-xs text-white/50">
              Password
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-white outline-none focus:border-[#c6a15b]"
              />
            </label>
            {error && (
              <p role="alert" className="text-xs text-red-300">
                {error}
              </p>
            )}
            <button disabled={loading} className="btn-primary w-full">
              {loading && <LoaderCircle className="animate-spin" size={16} />}
              Sign in
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
