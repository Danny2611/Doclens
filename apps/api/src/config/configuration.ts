import { parseS3StorageConfig } from '@doclens/storage';

export const configuration = () => ({
  api: {
    port: Number(process.env.API_PORT),
  },
  storage: parseS3StorageConfig(process.env),
});
