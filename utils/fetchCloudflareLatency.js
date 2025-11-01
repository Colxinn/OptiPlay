const axios = require("axios");

/**
 * Fetch latency/jitter metrics for a set of Cloudflare locations by using the
 * Radar Speed summary endpoint. The API supports filtering by comma-separated
 * ISO alpha-2 country codes or by continent code.
 *
 * @param {object} options
 * @param {string[]} [options.locations] - ISO alpha-2 location codes.
 * @param {string|null} [options.continent] - Optional continent code (for example, "EU").
 * @returns {Promise<object>} Parsed Cloudflare Radar metrics for the provided filter.
 */
async function fetchCloudflareLatency(options = {}) {
  const { locations = [], continent = null } = options;

  const headers = { "User-Agent": "OptiPlay-Latency-Updater" };
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const authEmail = process.env.CLOUDFLARE_API_EMAIL;
  const authKey = process.env.CLOUDFLARE_API_KEY;

  if (apiToken) {
    headers.Authorization = `Bearer ${apiToken}`;
  } else if (authEmail && authKey) {
    headers["X-Auth-Email"] = authEmail;
    headers["X-Auth-Key"] = authKey;
  } else {
    console.error("[CloudflareRadar] Missing API credentials.");
    return { error: true, source: "Cloudflare Radar (Speed)" };
  }

  const params = {};
  if (Array.isArray(locations) && locations.length) {
    params.location = locations.join(",");
  }
  if (continent) {
    params.continent = continent;
  }
  if (!params.location && !params.continent) {
    // Default to global US metrics if nothing else was supplied.
    params.location = "US";
  }

  const toNumber = (value) => {
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  try {
    const response = await axios.get(
      "https://api.cloudflare.com/client/v4/radar/quality/speed/summary",
      {
        headers,
        params,
        timeout: 10_000,
      }
    );

    const payload = response.data ?? {};
    if (!payload.success) {
      throw new Error(
        payload.errors?.map((err) => err.message).join("; ") ||
          "Unknown Cloudflare Radar error"
      );
    }

    const result = payload.result ?? {};
    const summaryKey =
      Object.keys(result).find((key) => key.startsWith("summary_")) ?? null;
    const summary = summaryKey ? result[summaryKey] : null;

    if (!summary) {
      throw new Error("Missing summary payload from Cloudflare Radar response");
    }

    const meta = result.meta ?? {};
    const timestamp =
      (meta.lastUpdated && new Date(meta.lastUpdated).toISOString()) ||
      new Date().toISOString();

    return {
      source: "Cloudflare Radar (Speed)",
      latencyAvg: toNumber(summary.latencyIdle ?? summary.latency),
      latencyLoaded: toNumber(summary.latencyLoaded),
      jitterAvg: toNumber(summary.jitterIdle ?? summary.jitter),
      jitterLoaded: toNumber(summary.jitterLoaded),
      packetLoss: toNumber(summary.packetLoss),
      bandwidthDownload: toNumber(summary.bandwidthDownload),
      bandwidthUpload: toNumber(summary.bandwidthUpload),
      timestamp,
      totalTests: Array.isArray(meta.totalTests)
        ? meta.totalTests.reduce(
            (acc, entry) =>
              acc + (Number.isFinite(Number(entry?.count)) ? Number(entry.count) : 0),
            0
          )
        : null,
      normalization: meta.normalization ?? null,
      filters: params,
      error: false,
    };
  } catch (error) {
    const details =
      error?.response?.data ??
      error?.message ??
      (typeof error === "string" ? error : "Unknown Cloudflare Radar error");
    console.error("[CloudflareRadar] Failed to fetch latency metrics:", details);
    return {
      source: "Cloudflare Radar (Speed)",
      error: true,
      filters: params,
      message:
        typeof details === "string" ? details : JSON.stringify(details, null, 2),
    };
  }
}

module.exports = { fetchCloudflareLatency };
