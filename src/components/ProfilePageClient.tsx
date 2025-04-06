"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
  startupName: string;
  startupUrl: string | null;
}

interface ProfilePageClientProps {
  userId?: string;
}

export default function ProfilePageClient({ userId }: ProfilePageClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [startupUrl, setStartupUrl] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Determine if viewing own profile
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    const currentUserId = tokenData.id.toString();
    setIsCurrentUser(!userId || userId === currentUserId);

    // Fetch user data
    const fetchUser = async () => {
      try {
        const endpoint = isCurrentUser
          ? "/api/user/profile"
          : `/api/users/${userId}`;

        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUser(data.user);
        setStartupUrl(data.user.startupUrl || "");
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchUser();
  }, [router, userId]);

  const handleUpdateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurrentUser) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/user/update-url", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ startupUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Startup URL updated successfully!");
      setUser((prev) => (prev ? { ...prev, startupUrl } : null));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-indigo-200 mb-4"></div>
          <div className="h-4 w-32 bg-indigo-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.name}
              </h1>
              <p className="text-indigo-100 text-lg">{user.startupName}</p>
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="space-y-6">
              {isCurrentUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              )}

              {isCurrentUser ? (
                <form onSubmit={handleUpdateUrl} className="space-y-4">
                  <div>
                    <label
                      htmlFor="startupUrl"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Startup URL
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="url"
                        id="startupUrl"
                        value={startupUrl}
                        onChange={(e) => setStartupUrl(e.target.value)}
                        placeholder="https://your-startup.com"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  {message && (
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
                      {message}
                    </div>
                  )}
                </form>
              ) : null}

              {user.startupUrl && (
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Startup URL:</p>
                  <Link
                    href={user.startupUrl}
                    target="_blank"
                    className="text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-2"
                  >
                    {user.startupUrl}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
