DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = current_schema()
      AND indexname = 'GameBenchmark_gameId_gpuId_cpuId_resolution_key'
  ) THEN
    CREATE UNIQUE INDEX "GameBenchmark_gameId_gpuId_cpuId_resolution_key"
      ON "GameBenchmark"("gameId", "gpuId", "cpuId", "resolution");
  END IF;
END$$;
