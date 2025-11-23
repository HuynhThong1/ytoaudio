import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

/**
 * GET /api/info
 * Optional gated access: if CONVERT_ACCESS_CODE env var is set, client must pass matching
 * code in the `x-access-code` header. When valid and YT_COOKIE is present, we include the
 * raw YouTube cookie header to attempt fetching restricted video metadata.
 *
 * This approach is fragile and may violate YouTube ToS depending on usage; prefer limiting
 * to public videos. We never expose the cookie value to clients.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  if (!ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  // Access code gating only if env var configured
  const requiredCode = process.env.CONVERT_ACCESS_CODE;
  if (requiredCode) {
    const providedCode = request.headers.get('x-access-code');
    if (!providedCode || providedCode !== requiredCode) {
      return NextResponse.json({ error: 'Access code required or invalid' }, { status: 401 });
    }
  }

  try {
    // Attach YouTube cookie only if access code valid & cookie available
    const ytCookie = process.env.YT_COOKIE;
    const info = await ytdl.getInfo(url, ytCookie ? { requestOptions: { headers: { cookie: ytCookie } } } : undefined);

    const videoDetails = info.videoDetails;
    const formats = ytdl.filterFormats(info.formats, 'audioonly');

    return NextResponse.json({
      title: videoDetails.title,
      thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
      duration: videoDetails.lengthSeconds,
      author: videoDetails.author.name,
      formats: formats.map((f) => ({
        itag: f.itag,
        container: f.container,
        quality: f.audioQuality,
        codecs: f.codecs,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    const message = error?.message || '';
    if (typeof message === 'string' && message.includes("Sign in to confirm you're not a bot")) {
      return NextResponse.json({ error: 'YouTube requires a signed-in account for this video (age/bot check).' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 500 });
  }
}
