"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => {
        // Redirect to landing page if not authenticated
        router.push("/");
      });
  }, [router]);

  const handleLogout = () => {
    fetch("http://localhost:8000/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      router.push("/");
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm ring-1 ring-gray-900/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                B
              </div>
              <span className="text-xl font-bold text-gray-900">BnB26</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.name}
                </span>
                {user?.picture ? (
                  <img
                    className="h-9 w-9 rounded-full ring-2 ring-indigo-500/30 object-cover"
                    src={user.picture}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="mt-2 text-lg text-gray-500">
                You have successfully authenticated using Google OAuth.
              </p>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="text-lg font-medium text-gray-900">Your Account Details</h3>
            <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md hover:ring-indigo-500/50">
              <div className="aspect-[4/3] w-full bg-gray-200 overflow-hidden">
                <div className="h-full w-full bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900">Discover properties</h3>
                <p className="mt-1 text-sm text-gray-500">Explore amazing stays curated just for you in your dashboard.</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
