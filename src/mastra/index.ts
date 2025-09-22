
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import dotenv from 'dotenv';
import { CloudExporter, SamplingStrategyType } from '@mastra/core/ai-tracing';
import { LangfuseExporter } from '@mastra/langfuse';
import { weatherTool } from './tools/weather-tool';
 
dotenv.config();

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),

  observability: {
    configs: {
      langfuse: {
        serviceName: 'ai',
        sampling: { type: SamplingStrategyType.ALWAYS },
        exporters: [
          new LangfuseExporter({
              publicKey: process.env.LANGFUSE_PUBLIC_KEY,
              secretKey: process.env.LANGFUSE_SECRET_KEY,
              baseUrl: process.env.LANGFUSE_HOST,
              realtime: true,
          }),
          new CloudExporter({
          accessToken: process.env.MASTRA_CLOUD_ACCESS_TOKEN, // Required (but can be pulled directly from the environment)
          maxBatchSize: 1000,    // Maximum spans per batch
          maxBatchWaitMs: 5000,  // Maximum wait time before flushing
        })
      ]

      }
    }
  },
});
