const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { fetchCloudflareLatency } = require("../utils/fetchCloudflareLatency");
const { fetchGoogleDnsPerf } = require("../utils/fetchGoogleDnsPerf");

const ENV_FILES = [".env.local", ".env"];
for (const file of ENV_FILES) {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath });
  }
}

const REGION_MAPPINGS = [
  { key: "NA-West", label: "North America West", locations: ["US", "CA"] },
  { key: "NA-East", label: "North America East", locations: ["US", "MX"] },
  { key: "SA", label: "South America", locations: ["BR", "AR", "CL"] },
  {
    key: "EU-West",
    label: "Europe West",
    locations: ["GB", "IE", "FR", "ES", "PT", "BE", "NL"],
  },
  {
    key: "EU-East",
    label: "Europe East",
    locations: ["DE", "PL", "CZ", "HU", "SE", "FI", "NO", "TR"],
  },
  { key: "Asia-NE", label: "Asia North-East", locations: ["JP", "KR", "TW"] },
  {
    key: "Asia-SE",
    label: "Asia South-East",
    locations: ["SG", "MY", "TH", "VN", "ID", "PH"],
  },
  { key: "Oceania", label: "Oceania", locations: ["AU", "NZ"] },
];

async function updateLatencyMetrics() {
  const cloudflare = await Promise.all(
    REGION_MAPPINGS.map(async (mapping) => {
      const response = await fetchCloudflareLatency({
        locations: mapping.locations,
        continent: mapping.continent ?? null,
      });

      return {
        region: mapping.key,
        label: mapping.label,
        cfRegion:
          Array.isArray(mapping.locations) && mapping.locations.length
            ? mapping.locations.join(",")
            : mapping.continent ?? null,
        locations: mapping.locations ?? [],
        continent: mapping.continent ?? null,
        latencyAvg: response.latencyAvg ?? null,
        latencyLoaded: response.latencyLoaded ?? null,
        jitterAvg: response.jitterAvg ?? null,
        jitterLoaded: response.jitterLoaded ?? null,
        packetLoss: response.packetLoss ?? null,
        bandwidthDownload: response.bandwidthDownload ?? null,
        bandwidthUpload: response.bandwidthUpload ?? null,
        totalTests: response.totalTests ?? null,
        timestamp: response.timestamp ?? null,
        error: response.error ?? false,
        source: response.source ?? "Cloudflare Radar (Speed)",
        filters: response.filters ?? null,
        message: response.message ?? null,
      };
    })
  );

  const google = await fetchGoogleDnsPerf();

  const metrics = {
    generatedAt: new Date().toISOString(),
    regions: REGION_MAPPINGS,
    sources: {
      cloudflare,
      google,
    },
  };

  const outputPath = path.resolve("data", "latencyMetrics.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2), "utf8");
  console.log("Latency metrics updated:", outputPath);
}

if (require.main === module) {
  updateLatencyMetrics().catch((error) => {
    console.error("Failed to update latency metrics:", error);
    process.exitCode = 1;
  });
}

module.exports = { updateLatencyMetrics };
