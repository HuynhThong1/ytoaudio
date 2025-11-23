import { NextResponse } from 'next/server';
import YTDlpWrap from 'yt-dlp-wrap';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Helper to ensure yt-dlp binary exists
async function getBinaryPath() {
  const isDev = process.env.NODE_ENV === 'development';
  // In dev, use project root. In prod (Vercel), use /tmp
  const dir = isDev ? process.cwd() : os.tmpdir();
  const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  const binaryPath = path.join(dir, binaryName);

  if (!fs.existsSync(binaryPath)) {
    console.log('Downloading yt-dlp binary to', binaryPath);
    await YTDlpWrap.downloadFromGithub(binaryPath);
  }
  return binaryPath;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const format = searchParams.get('format') || 'mp3';

  if (!url) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const supportedFormats = ['mp3', 'm4a', 'weba'];
  if (!supportedFormats.includes(format)) {
    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  }

  try {
    const binaryPath = await getBinaryPath();
    const ytDlpWrap = new YTDlpWrap(binaryPath);

    // 1. Get Video Metadata for filename
    const metadata = await ytDlpWrap.execPromise([
      url,
      '--dump-json',
      '--no-playlist'
    ]);
    const info = JSON.parse(metadata);
    const title = info.title.replace(/[^\w\s]/gi, '');
    const filename = `${title}.${format}`;

    // 2. Create Stream
    const stream = new ReadableStream({
      async start(controller) {
        const ytDlpProcess = ytDlpWrap.exec([
          url,
          '-x',
          '--audio-format', format,
          '--audio-quality', '0',
          '--ffmpeg-location', ffmpegPath || '',
          '-o', '-', // Stream to stdout
        ]);

        ytDlpProcess.on('ytDlpEvent', (eventType, eventData) => {
           // console.log(eventType, eventData); // Optional logging
        });

        ytDlpProcess.on('error', (error) => {
          console.error('yt-dlp process error:', error);
          controller.error(error);
        });

        ytDlpProcess.on('close', () => {
           controller.close();
        });

        // Pipe stdout to controller
        // @ts-ignore
        const stdout = ytDlpProcess.ytDlpProcess.stdout;
        if (stdout) {
            stdout.on('data', (chunk: Buffer) => {
                controller.enqueue(chunk);
            });
        }
      },
    });

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', `audio/${format}`);

    return new NextResponse(stream, {
      headers,
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
  }
}
