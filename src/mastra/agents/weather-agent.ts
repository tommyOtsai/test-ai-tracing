import { openai } from '@ai-sdk/openai';
import { Agent, AgentGenerateOptions } from '@mastra/core/agent';
import { weatherTool } from '../tools/weather-tool';
import { LangfuseClient } from "@langfuse/client";

const langfuseClient = new LangfuseClient({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_HOST,
});

const prompt = await langfuseClient.prompt.get("Weather Agent Prompt");
const config = prompt.config as { generationOptions: AgentGenerateOptions };
const generateOptions = {
  ...config.generationOptions, 
  telemetry: {
    isEnabled: true,
    metadata: {
      langfusePrompt: prompt.toJSON(),
    },
  },
}


export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: prompt.prompt,
  model: openai('gpt-5'),
  tools: { weatherTool },
  defaultGenerateOptions: generateOptions,
});
