"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import Header from "../components/Header";
import {
  Crown,
  Music,
  Share2,
  ExternalLink,
  Copy,
  CheckCheck,
  Zap,
  TrendingUp,
  IndianRupee,
  Loader2,
  Tv2,
} from "lucide-react";

interface QueueItem {
  id: string;
  title: string;
  thumbnail: string;
  votes: number;
  isPriority: boolean;
  payment?: { amount: number; status: string; createdAt: string };
}

interface DashboardStats {
  regularCount: number;
  priorityCount: number;
  totalTips: number;
  streamUrl: string;
  creatorId: string;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div
    className={`flex-1 rounded-2xl bg-gray-800/60 border border-gray-700/40 p-5 flex items-center gap-4`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

export default function CreatorDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [regularQueue, setRegularQueue] = useState<QueueItem[]>([]);
  const [priorityQueue, setPriorityQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Step 1: get this creator's id
      const userRes = await axios.get("/api/user");
      const creatorId: string = userRes.data.userId.id;
      const streamUrl = `${window.location.origin}/creator/${creatorId}`;

      // Step 2: get their queue
      const streamsRes = await axios.get(
        `/api/streams?creatorId=${creatorId}`
      );
      const streams: any[] = streamsRes.data.streams ?? [];

      const regular = streams
        .filter((s) => s.payment?.status !== "COMPLETED")
        .sort((a, b) => b.upvotes - a.upvotes);

      const priority = streams
        .filter((s) => s.payment?.status === "COMPLETED")
        .sort(
          (a, b) =>
            b.payment.amount - a.payment.amount ||
            new Date(a.payment.createdAt).getTime() -
              new Date(b.payment.createdAt).getTime()
        );

      setRegularQueue(
        regular.map((s) => ({
          id: s.id,
          title: s.title,
          thumbnail: s.smallImg,
          votes: s.upvotes,
          isPriority: false,
        }))
      );

      setPriorityQueue(
        priority.map((s) => ({
          id: s.id,
          title: s.title,
          thumbnail: s.smallImg,
          votes: s.upvotes,
          isPriority: true,
          payment: s.payment,
        }))
      );

      const totalTips = priority.reduce(
        (sum: number, s: any) => sum + (s.payment?.amount ?? 0),
        0
      );

      setStats({
        regularCount: regular.length,
        priorityCount: priority.length,
        totalTips,
        streamUrl,
        creatorId,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
      const interval = setInterval(fetchData, 10_000);
      return () => clearInterval(interval);
    }
  }, [status, fetchData]);

  const copyLink = () => {
    if (!stats?.streamUrl) return;
    navigator.clipboard.writeText(stats.streamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
          <p className="text-gray-400 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
        <div className="text-center p-10 bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 max-w-sm w-full mx-4">
          <Tv2 className="h-10 w-10 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Access your creator dashboard to manage your stream queue.
          </p>
          <button
            onClick={() => signIn()}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-200"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      <Header />

      <main className="container mx-auto px-4 pb-16 max-w-5xl">
        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
            Creator Dashboard
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Welcome back,{" "}
            <span className="text-gray-200">
              {session.user?.name ?? session.user?.email}
            </span>
            ! Here&apos;s your stream at a glance.
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <StatCard
            icon={Music}
            label="Songs in Queue"
            value={stats?.regularCount ?? 0}
            color="bg-purple-900/50 text-purple-400"
          />
          <StatCard
            icon={Crown}
            label="Priority Requests"
            value={stats?.priorityCount ?? 0}
            color="bg-yellow-900/50 text-yellow-400"
          />
          <StatCard
            icon={IndianRupee}
            label="Total Tips Earned"
            value={`₹${stats?.totalTips?.toLocaleString() ?? 0}`}
            color="bg-green-900/50 text-green-400"
          />
        </div>

        {/* ── Share link ── */}
        <div className="mb-6 p-5 rounded-2xl bg-gray-800/60 border border-gray-700/40">
          <h2 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Your Audience Stream Link
          </h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm text-purple-300 bg-gray-900/50 px-4 py-2.5 rounded-xl border border-gray-700/40 truncate">
              {stats?.streamUrl ?? "Loading…"}
            </code>
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                copied
                  ? "bg-green-700/40 text-green-300"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-200"
              }`}
            >
              {copied ? (
                <>
                  <CheckCheck className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
            {stats?.creatorId && (
              <Link
                href={`/creator/${stats.creatorId}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-purple-700 hover:bg-purple-600 text-white transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                Open Stream
              </Link>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share this link with your audience so they can submit songs and vote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Regular queue ── */}
          <div className="rounded-2xl bg-gray-800/60 border border-gray-700/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-700/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <h2 className="font-semibold text-gray-200">Regular Queue</h2>
              </div>
              <span className="text-xs bg-gray-700/60 text-gray-400 px-2.5 py-0.5 rounded-full">
                {regularQueue.length} songs
              </span>
            </div>
            <div className="p-4">
              {regularQueue.length === 0 ? (
                <div className="py-8 flex flex-col items-center text-gray-500">
                  <Music className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No songs queued yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700/50">
                  {regularQueue.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-700/30 transition-colors"
                    >
                      <span className="text-xs text-gray-500 w-4 text-right">
                        {i + 1}
                      </span>
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-14 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <p className="flex-1 text-sm text-gray-200 truncate">
                        {item.title}
                      </p>
                      <span className="text-xs text-purple-400 flex-shrink-0">
                        ▲ {item.votes}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Priority queue ── */}
          <div className="rounded-2xl bg-gradient-to-br from-yellow-950/40 to-gray-800/60 border border-yellow-800/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-yellow-800/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <h2 className="font-semibold text-yellow-300">
                  Priority Queue
                </h2>
              </div>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2.5 py-0.5 rounded-full">
                {priorityQueue.length} paid
              </span>
            </div>
            <div className="p-4">
              {priorityQueue.length === 0 ? (
                <div className="py-8 flex flex-col items-center text-gray-500">
                  <Zap className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No priority requests yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-yellow-800/40">
                  {priorityQueue.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-yellow-900/20 transition-colors"
                    >
                      <span className="text-xs text-gray-500 w-4 text-right">
                        {i === 0 ? "⚡" : `#${i + 1}`}
                      </span>
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-14 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <p className="flex-1 text-sm text-gray-200 truncate">
                        {item.title}
                      </p>
                      <span className="text-xs text-yellow-400 font-semibold flex-shrink-0">
                        ₹{item.payment?.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        {stats?.creatorId && (
          <div className="mt-6">
            <Link
              href={`/creator/${stats.creatorId}`}
              className="flex items-center justify-center gap-3 w-full py-3.5 bg-purple-600 hover:bg-purple-500 rounded-2xl text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/40 group"
            >
              <Tv2 className="h-5 w-5" />
              Open My Live Stream
              <ExternalLink className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-center text-xs text-gray-500 mt-2">
              This is the page with the video player — use it during your
              stream.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
