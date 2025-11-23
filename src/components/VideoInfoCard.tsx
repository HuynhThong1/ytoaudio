import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface VideoInfo {
    title: string;
    thumbnail: string;
    duration: string;
    author: string;
}

interface VideoInfoCardProps {
    info: VideoInfo;
}

export function VideoInfoCard({ info }: VideoInfoCardProps) {
    return (
        <Card className="w-full max-w-md mx-auto mt-6 overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 shadow-xl">
            <CardHeader className="p-0">
                <div className="relative w-full aspect-video">
                    <img
                        src={info.thumbnail}
                        alt={info.title}
                        className="object-cover"
                        style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
                <CardTitle className="text-lg font-bold line-clamp-2 leading-tight" data-testid="video-title">
                    {info.title}
                </CardTitle>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{info.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(info.duration)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
