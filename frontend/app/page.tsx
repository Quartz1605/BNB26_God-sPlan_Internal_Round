"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already authenticated
    fetch("http://localhost:8000/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          router.push("/dashboard");
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const handleLogin = () => {
    window.location.href = "http://localhost:8000/auth/login";
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-200 opacity-50 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 h-96 w-96 -translate-y-1/2 translate-x-1/3 rounded-full bg-indigo-200 opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-blue-200 opacity-50 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 text-center backdrop-blur-sm">
        <div>
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
            Welcome to <span className="text-indigo-600">BnB26</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Your premium destination for discovering amazing stays.
          </p>
        </div>
        
        <div className="mt-10 flex flex-col space-y-4 rounded-2xl bg-white/80 p-8 shadow-xl ring-1 ring-gray-900/5">
          <button
            onClick={handleLogin}
            className="group relative flex w-full justify-center overflow-hidden rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-md transition-all duration-300 hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.98]"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </span>
            <span className="pl-6">Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
