import Link from "next/link";
import {
  checkAdminAuth,
  isAdminConfigured,
  isUsingDemoAuth,
} from "@/lib/admin-auth";
import { getContent, getContentStoreMode } from "@/lib/content-store";
import LoginForm from "./LoginForm";
import Editor from "./Editor";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAdminConfigured() && process.env.NODE_ENV === "production") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50/60 px-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-900">
            Administration non configurée
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Définissez <code className="font-mono text-amber-800">ADMIN_PASSWORD</code>{" "}
            (et idéalement <code className="font-mono text-amber-800">AUTH_SECRET</code>)
            dans les variables d&apos;environnement Vercel, puis redéployez.
          </p>
        </div>
      </div>
    );
  }

  const auth = await checkAdminAuth();
  if (!auth.ok) {
    return <LoginForm demoHint={isUsingDemoAuth()} />;
  }

  const content = await getContent();
  const storeMode = getContentStoreMode();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-sky-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-[10px] font-medium tracking-[0.2em] text-sky-600 uppercase">
              JCF Boat
            </p>
            <h1 className="text-lg font-semibold text-slate-900">Panneau admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-xs text-sky-600 transition hover:text-sky-800 sm:inline"
            >
              Voir le site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <Editor initialContent={content} storeMode={storeMode} />
    </>
  );
}
