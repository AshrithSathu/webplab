"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Update {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    startupName: string;
  };
}

interface Poll {
  id: number;
  question: string;
  createdAt: string;
  options: {
    id: number;
    text: string;
    votes: number;
  }[];
  user: {
    id: number;
    name: string;
    startupName: string;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [updates, setUpdates] = useState<(Update | Poll)[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const fetchUpdates = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch both updates and polls
      const [updatesRes, pollsRes] = await Promise.all([
        fetch(`/api/updates?page=${page}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`/api/polls?page=${page}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const [updatesData, pollsData] = await Promise.all([
        updatesRes.json(),
        pollsRes.json(),
      ]);

      if (!updatesRes.ok) throw new Error(updatesData.error);
      if (!pollsRes.ok) throw new Error(pollsData.error);

      // Combine and sort updates and polls by creation date
      const combinedData = [
        ...(updatesData.updates || []),
        ...(pollsData.polls || []),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (page === 1) {
        setUpdates(combinedData);
      } else {
        setUpdates((prev) => [...prev, ...combinedData]);
      }

      // Set hasMore if either updates or polls have more data
      setHasMore(updatesData.hasMore || pollsData.hasMore);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !isPollMode) || (isPollMode && !content.trim()))
      return;

    try {
      const token = localStorage.getItem("token");

      if (isPollMode) {
        const validOptions = pollOptions.filter((opt) => opt.trim());
        if (validOptions.length < 2) {
          setError("Please add at least 2 poll options");
          return;
        }

        const res = await fetch("/api/polls", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: content,
            options: validOptions,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setUpdates((prev) => [data.poll, ...prev]);
      } else {
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
      }

      setContent("");
      setPollOptions(["", ""]);
      setIsPollMode(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVote = async (pollId: number, optionId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ optionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUpdates((prev) =>
        prev.map((item) =>
          "question" in item && item.id === pollId ? data.poll : item
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUpdates();
  }, [router, page]); // Add dependencies to trigger fetch when page changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 transform transition-all duration-200 hover:shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Share an Update
            </h2>
            <button
              type="button"
              onClick={() => setIsPollMode(!isPollMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isPollMode
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600"
              }`}
            >
              {isPollMode ? "Cancel Poll" : "Create Poll"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isPollMode
                  ? "Ask a question..."
                  : "What's new with your startup? Share your latest milestones, achievements, or thoughts..."
              }
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-gray-700"
              rows={4}
            />

            {isPollMode && (
              <div className="space-y-3">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...pollOptions];
                        newOptions[index] = e.target.value;
                        setPollOptions(newOptions);
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {index > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setPollOptions(
                            pollOptions.filter((_, i) => i !== index)
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    + Add Option
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isPollMode ? "Create Poll" : "Share Update"}
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
          {updates.map((item) => (
            <div
              key={`${"question" in item ? "poll" : "update"}-${item.id}`}
              className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between mb-4">
                <Link
                  href={`/profile/${item.user.id}`}
                  className="group flex-col"
                >
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {item.user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.user.startupName}
                  </p>
                </Link>
                <time className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>

              {"question" in item ? (
                <div className="space-y-4">
                  <p className="text-gray-700 font-medium">
                    {(item as Poll).question}
                  </p>
                  <div className="space-y-2">
                    {(item as Poll).options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleVote(item.id, option.id)}
                        className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left relative overflow-hidden group"
                      >
                        <div
                          className={`absolute inset-0 ${
                            option.votes > 0 ? "bg-green-50" : "bg-indigo-50"
                          } opacity-50 transition-all duration-300`}
                          style={{
                            width: `${
                              (option.votes /
                                (item as Poll).options.reduce(
                                  (acc, curr) => acc + curr.votes,
                                  0
                                )) *
                                100 || 0
                            }%`,
                          }}
                        />
                        <div className="relative flex justify-between">
                          <span
                            className={
                              option.votes > 0
                                ? "text-green-700"
                                : "text-gray-700"
                            }
                          >
                            {option.text}
                          </span>
                          <span
                            className={
                              option.votes > 0
                                ? "text-green-600"
                                : "text-gray-500"
                            }
                          >
                            {option.votes} votes
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {(item as Update).content}
                </p>
              )}
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
