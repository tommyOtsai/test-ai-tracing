
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import dotenv from 'dotenv';
import { CloudExporter, SamplingStrategyType } from '@mastra/core/ai-tracing';
import { LangfuseExporter } from '@mastra/langfuse';
 
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
  telemetry: {
    serviceName: "ai",
    enabled: true,
    sampling: { type: "always_on" },
    export: {
      type: "otlp",
      endpoint: 'https://cloud.langfuse.com/api/public/otel/v1/traces', // or your preferred endpoint
      headers: {
        Authorization: `Basic ${process.env.LANGFUSE_BASIC_AUTH_STRING}`, // Your base64-encoded auth string
      },
    },
  },
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
          endpoint: 'https://api.mastra.ai/ai/spans/publish', // Optional custom endpoint
          maxBatchSize: 1000,    // Maximum spans per batch
          maxBatchWaitMs: 5000,  // Maximum wait time before flushing
        })
      ]

      }
    }
  },
});
