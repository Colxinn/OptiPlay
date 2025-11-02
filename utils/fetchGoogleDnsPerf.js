const axios = require("axios");
const { performance } = require("node:perf_hooks");

/**
 * Estimate Google Public DNS resolution latency.
 * @returns {Promise<object>} Latency metric or error flag when unavailable.
 */
async function fetchGoogleDnsPerf() {
  try {
    const requestConfig = {
      headers: { "User-Agent": "OptiPlay-Latency-Updater" },
      timeout: 5_000,
    };
    const start = performance.now();
    await axios.get("https://dns.google/resolve?name=example.com", requestConfig);
    const latency = performance.now() - start;

    return {
      source: "Google Public DNS",
      avgResolutionMs: Math.round(latency),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[GoogleDNS] Error fetching DNS latency:`, error?.message ?? error);
    return { source: "Google Public DNS", error: true };
  }
}

module.exports = { fetchGoogleDnsPerf };
