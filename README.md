<a href="https://gemini.vercel.ai/">
  <img alt="Gemini Reasoning - AI image reasoning demo" src="app/(chat)/opengraph-image.png">
  <h1 align="center">Gemini Reasoning</h1>
</a>

<p align="center">
  An open source image reasoning demo powered by Google Gemini, built with Next.js and the AI SDK v7 beta.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#models"><strong>Models</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a>
</p>

## Features

- [Next.js 16](https://nextjs.org) App Router with proxy
- [AI SDK v7 beta](https://sdk.vercel.ai/docs) with `streamText` and `useChat`
  - Real-time streaming of reasoning and images
  - `reasoning-file` support for draft image separation
  - Google AI Gateway with provider fallback
- Image reasoning with draft exploration
  - 3 draft images generated in reasoning
  - Side-by-side comparison before final selection
  - Multi-turn image editing
- [Vercel BotID](https://vercel.com/docs/botid) for bot protection
- [Tailwind CSS](https://tailwindcss.com) with [Radix UI](https://radix-ui.com) primitives
- [Vercel Postgres](https://vercel.com/storage/postgres) for chat persistence
- Slash commands (`/new`, `/clear`, `/delete`, `/theme`, `/help`)
- Keyboard shortcuts (`Cmd+N`, `Cmd+K`, `Cmd+Shift+Backspace`)

## Models

- **Gemini 3.1 Flash Image** - fast image generation with high-level reasoning
- **Gemini 3 Pro Image** - higher quality image generation

## Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fgemini-chatbot&env=GOOGLE_GENERATIVE_AI_API_KEY&envDescription=Get%20your%20Google%20AI%20API%20key&envLink=https%3A%2F%2Faistudio.google.com%2Fapp%2Fapikey&demo-title=Gemini%20Reasoning&demo-description=Image%20reasoning%20demo%20with%20Gemini&demo-url=https%3A%2F%2Fgemini.vercel.ai&stores=[{%22type%22:%22postgres%22}])

## Running Locally

You will need a `GOOGLE_GENERATIVE_AI_API_KEY` and a Postgres database. Copy `.env.example` to `.env.local` and fill in the values.

```bash
pnpm install
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).
