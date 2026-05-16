import express from "express";
import Confession from "../models/confession.js";

function clampNumber(value, min, max) {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  return Math.min(max, Math.max(min, num));
}

function hashStringToInt(str = "") {
  // Deterministic, non-crypto hash for stable UI identifiers
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // eslint-disable-line no-bitwise
  }
  return Math.abs(hash);
}

function getPlayerNumber(user) {
  const base = user?.id || user?.displayName || "player";
  return 100 + (hashStringToInt(String(base)) % 900);
}

function getDivisionLabel(user) {
  const email = user?.emails?.[0]?.value || "";
  const domain = email.includes("@") ? email.split("@")[1] : "";
  if (!domain) return "Unknown Division";
  const org = domain.split(".")[0] || domain;
  return `${org.charAt(0).toUpperCase()}${org.slice(1)} Division`;
}

function formatHourRange(hourStart, durationHours = 2) {
  const start = ((hourStart % 24) + 24) % 24;
  const end = (start + durationHours) % 24;

  const fmt = (h) => {
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return { h12, period };
  };

  const a = fmt(start);
  const b = fmt(end);

  if (a.period === b.period) return `${a.h12}–${b.h12} ${a.period}`;
  return `${a.h12} ${a.period}–${b.h12} ${b.period}`;
}

function getRelativeTimeLabel(dateValue) {
  const ms = Date.now() - new Date(dateValue).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "just now";
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function computeMood(vibeCounts = {}) {
  const secret = vibeCounts.secret || 0;
  const crush = vibeCounts.crush || 0;
  const funny = vibeCounts.funny || 0;
  const study = vibeCounts.study || 0;
  const total = secret + crush + funny + study;

  const intensePct = total ? Math.round((secret / total) * 100) : 0;
  const chillPct = total ? Math.round(((crush + funny) / total) * 100) : 0;

  const label =
    intensePct >= 55
      ? { emoji: "🔥", text: "Intense" }
      : chillPct >= 55
        ? { emoji: "🟢", text: "Chill" }
        : { emoji: "⚖️", text: "Balanced" };

  return {
    intensePct: clampNumber(intensePct, 0, 100),
    chillPct: clampNumber(chillPct, 0, 100),
    label,
  };
}

export default function createStatsRouter({ activePlayers }) {
  const router = express.Router();

  router.get("/global", async (req, res) => {
    try {
      const now = Date.now();
      const last24h = new Date(now - 24 * 60 * 60 * 1000);
      const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);

      const [totalMessages, reactionsAgg, trendingTagsAgg, vibeAgg, hourAgg] =
        await Promise.all([
          Confession.countDocuments(),
          Confession.aggregate([
            {
              $project: {
                total: {
                  $add: [
                    { $ifNull: ["$reactions.heart", 0] },
                    { $ifNull: ["$reactions.laugh", 0] },
                    { $ifNull: ["$reactions.sad", 0] },
                  ],
                },
              },
            },
            { $group: { _id: null, totalReactions: { $sum: "$total" } } },
          ]),
          Confession.aggregate([
            { $match: { createdAt: { $gte: last24h } } },
            { $unwind: "$tags" },
            {
              $project: {
                tag: {
                  $toLower: {
                    $trim: { input: { $ifNull: ["$tags", ""] } },
                  },
                },
                createdAt: 1,
              },
            },
            { $match: { tag: { $ne: "" } } },
            {
              $group: {
                _id: "$tag",
                count: { $sum: 1 },
                lastSeenAt: { $max: "$createdAt" },
              },
            },
            { $sort: { count: -1, lastSeenAt: -1 } },
            { $limit: 12 },
            {
              $project: {
                _id: 0,
                tag: "$_id",
                count: 1,
                lastSeenAt: 1,
              },
            },
          ]),
          Confession.aggregate([
            { $match: { createdAt: { $gte: last24h } } },
            {
              $project: {
                vibe: {
                  $toLower: {
                    $trim: { input: { $ifNull: ["$vibe", ""] } },
                  },
                },
              },
            },
            { $match: { vibe: { $in: ["crush", "study", "funny", "secret"] } } },
            { $group: { _id: "$vibe", count: { $sum: 1 } } },
          ]),
          Confession.aggregate([
            { $match: { createdAt: { $gte: last7d } } },
            {
              $project: {
                hour: { $hour: { date: "$createdAt", timezone: "Asia/Kolkata" } },
              },
            },
            { $group: { _id: "$hour", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),
        ]);

      const totalReactions = reactionsAgg?.[0]?.totalReactions || 0;

      const vibeCounts = vibeAgg.reduce((acc, row) => {
        acc[row._id] = row.count;
        return acc;
      }, {});

      const mood = computeMood(vibeCounts);

      const hourly = new Array(24).fill(0);
      hourAgg.forEach((row) => {
        if (typeof row?._id === "number") hourly[row._id] = row.count || 0;
      });

      let bestHour = 20;
      let bestWindow = -1;
      for (let h = 0; h < 24; h += 1) {
        const window = hourly[h] + hourly[(h + 1) % 24];
        if (window > bestWindow) {
          bestWindow = window;
          bestHour = h;
        }
      }
      const peakHours = formatHourRange(bestHour, 2);

      const onlineWindowMs = 10 * 60 * 1000;
      const activeUsers = Array.from(activePlayers.values()).filter(
        (ts) => now - ts <= onlineWindowMs,
      ).length;

      const trendingTags = trendingTagsAgg.map((t) => ({
        ...t,
        timeLabel: getRelativeTimeLabel(t.lastSeenAt),
      }));

      res.json({
        totals: {
          messages: totalMessages,
          reactions: totalReactions,
        },
        mood,
        peakHours,
        activeUsers,
        trendingTags,
        vibeCounts,
        lastUpdatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("STATS /global ERROR:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  router.get("/me", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Login required" });

      const userId = req.user.id;
      const [drops, reactionsAgg] = await Promise.all([
        Confession.countDocuments({ userID: userId }),
        Confession.aggregate([
          { $match: { userID: userId } },
          {
            $project: {
              total: {
                $add: [
                  { $ifNull: ["$reactions.heart", 0] },
                  { $ifNull: ["$reactions.laugh", 0] },
                  { $ifNull: ["$reactions.sad", 0] },
                ],
              },
            },
          },
          { $group: { _id: null, totalReactions: { $sum: "$total" } } },
        ]),
      ]);

      res.json({
        player: {
          number: getPlayerNumber(req.user),
          division: getDivisionLabel(req.user),
          displayName: req.user.displayName || "Player",
        },
        stats: {
          drops,
          reactionsReceived: reactionsAgg?.[0]?.totalReactions || 0,
        },
      });
    } catch (err) {
      console.error("STATS /me ERROR:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

  return router;
}

