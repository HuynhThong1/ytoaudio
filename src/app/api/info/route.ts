import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  if (!ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
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
  } catch (error) {
    console.error('Error fetching video info:', error);
    return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 500 });
  }
}
