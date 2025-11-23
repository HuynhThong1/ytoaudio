"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { VideoInfoCard } from './VideoInfoCard';
import { Loader2, Music, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export function ConverterForm() {
    const [url, setUrl] = useState('');
    const [format, setFormat] = useState('mp3');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoInfo, setVideoInfo] = useState<any>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadedBytes, setDownloadedBytes] = useState(0);

    const handleFetchInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setVideoInfo(null);

        try {
            const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch video info');
            }

            setVideoInfo(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDownload = async () => {
        if (!url || !format) return;

        setIsDownloading(true);
        setDownloadProgress(0);
        setDownloadedBytes(0);
        setError(null);

        try {
            const response = await fetch(`/api/convert?url=${encodeURIComponent(url)}&format=${format}`);

            if (!response.ok) throw new Error('Download failed');
            if (!response.body) throw new Error('No response body');

            const contentLength = response.headers.get('Content-Length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;

            const reader = response.body.getReader();
            const chunks = [];
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedLength += value.length;
                setDownloadedBytes(receivedLength);

                if (total > 0) {
                    setDownloadProgress(Math.round((receivedLength / total) * 100));
                }
            }

            const blob = new Blob(chunks);
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${videoInfo?.title || 'audio'}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

        } catch (err: any) {
            setError(err.message || 'Download failed');
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto space-y-6">
            <form onSubmit={handleFetchInfo} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="url" className="text-lg font-medium">YouTube URL</Label>
                    <div className="flex gap-2">
                        <Input
                            id="url"
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1 h-12 text-lg bg-background/50 backdrop-blur-sm"
                        />
                        <Button type="submit" size="lg" disabled={loading || isDownloading} className="h-12 px-6">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fetch'}
                        </Button>
                    </div>
                </div>
            </form>

            {error && (
                <Alert variant="destructive" data-testid="error-alert">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {videoInfo && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <VideoInfoCard info={videoInfo} />

                    <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border">
                        <div className="flex items-end gap-4">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="format">Select Format</Label>
                                <Select value={format} onValueChange={setFormat} disabled={isDownloading}>
                                    <SelectTrigger id="format" className="h-10 bg-background">
                                        <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mp3">MP3 (Audio)</SelectItem>
                                        <SelectItem value="m4a">M4A (Audio)</SelectItem>
                                        <SelectItem value="weba">WEBA (Audio)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleDownload} size="lg" disabled={isDownloading} className="w-full sm:w-auto gap-2">
                                {isDownloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                {isDownloading ? 'Downloading...' : `Download ${format.toUpperCase()}`}
                            </Button>
                        </div>

                        {isDownloading && (
                            <div className="space-y-2">
                                <Progress value={downloadProgress} className="h-2" />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{formatBytes(downloadedBytes)} downloaded</span>
                                    {downloadProgress > 0 && <span>{downloadProgress}%</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
