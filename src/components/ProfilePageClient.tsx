"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  startupName: string;
  startupUrl?: string;
  updates: Array<{
    id: string;
    content: string;
    createdAt: string;
  }>;
}

interface ProfilePageClientProps {
  userId: string;
}

export default function ProfilePageClient({ userId }: ProfilePageClientProps) {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUserProfile();
  }, [userId, router]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await res.json();
      setProfile(data.user);
    } catch (error) {
      console.error("Profile page error:", error);
      setError("Error loading profile");
    }
  };

  if (!profile) {
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
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              {profile.name}
            </h2>
            <div className="mt-2">
              {profile.startupUrl ? (
                <Link
                  href={profile.startupUrl}
                  target="_blank"
                  className="text-lg text-indigo-100 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  {profile.startupName}
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
              ) : (
                <span className="text-lg text-indigo-100">
                  {profile.startupName}
                </span>
              )}
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-center mb-8">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Contact via Email
              </a>
            </div>

            {error && (
              <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Latest Updates
              </h3>
              <div className="space-y-6">
                {profile.updates.map((update) => (
                  <div
                    key={update.id}
                    className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-6 transform transition-all duration-200 hover:shadow-md"
                  >
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {update.content}
                    </p>
                    <time className="mt-3 block text-sm text-gray-500 bg-white px-3 py-1 rounded-full w-fit">
                      {new Date(update.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </time>
                  </div>
                ))}
                {profile.updates.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-gray-500">No updates shared yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
