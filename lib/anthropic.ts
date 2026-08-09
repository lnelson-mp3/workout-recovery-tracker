import Anthropic from "@anthropic-ai/sdk";

// Server-only Anthropic client. Import this only from Next.js API routes /
// route handlers — never from a client component. The key must never reach
// the browser bundle.

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
}

export const anthropic = new Anthropic({ apiKey });
