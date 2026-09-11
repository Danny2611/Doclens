export const configuration = () => ({
  worker: {
    startupTimeoutMs: Number(process.env.WORKER_STARTUP_TIMEOUT_MS),
  },
});
