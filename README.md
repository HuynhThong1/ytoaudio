# ytomp3

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Restricted / Age-Limited YouTube Videos

Some YouTube videos require a signed-in session (age restriction, bot/region checks). Anonymous requests made by serverless platforms (like Vercel) may fail with the message:

```text
Sign in to confirm you're not a bot
```

To optionally attempt fetching these videos you can set two environment variables:

| Variable | Purpose |
|----------|---------|
| `CONVERT_ACCESS_CODE` | A secret code users must enter in the UI. If set, API routes require the code in `x-access-code` header. |
| `YT_COOKIE` | Raw `Cookie:` header string from a logged-in YouTube browser session. Used server-side only; never sent to clients. |

### Enabling Gated Cookie Usage

1. Obtain the YouTube cookie string from a logged-in session (be sure you understand YouTube's Terms of Service; using cookies may be disallowed for certain uses).
2. In Vercel project settings add `YT_COOKIE` with the full cookie string and `CONVERT_ACCESS_CODE` with a code you will share privately.
3. Redeploy.
4. In the UI enter the access code before fetching video info. If the code matches, the server attaches the cookie when calling YouTube.

If `CONVERT_ACCESS_CODE` is not set, the app behaves as before and does not attempt to use any cookie.

If a restricted video still cannot be fetched, a clear error is returned. Choose a different video or remove cookie usage.

