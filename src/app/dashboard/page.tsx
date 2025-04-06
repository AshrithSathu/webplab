"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Update {
  id: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
    startupName: string;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUpdates();
  }, [page, router]);

  const fetchUpdates = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/updates?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (page === 1) {
        setUpdates(data.updates);
      } else {
        setUpdates((prev) => [...prev, ...data.updates]);
      }
      setHasMore(data.hasMore);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUpdates((prev) => [data.update, ...prev]);
      setContent("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transform transition-all duration-200 hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Share an Update
          </h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's new with your startup? Share your latest milestones, achievements, or thoughts..."
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-gray-700"
              rows={4}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Share Update
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-500 text-sm p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {updates.map((update) => (
            <div
              key={update.id}
              className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between mb-4">
                <Link href="/profile" className="group flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {update.user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {update.user.startupName}
                  </p>
                </Link>
                <time className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  {new Date(update.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {update.content}
              </p>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="w-full py-4 mt-6 text-center text-indigo-600 bg-white rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </span>
              ) : (
                "Load More Updates"
              )}
            </button>
          )}

          {updates.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Updates Yet
              </h3>
              <p className="text-gray-500">
                Be the first to share an update with the community!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
