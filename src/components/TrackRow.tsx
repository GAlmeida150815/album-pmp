"use client";
import { useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StarRating from "./StarRating";
import type { Track } from "@/interfaces/Track";

interface TrackRowProps {
  track: Track;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  userRating?: number;
  volume: number;
}

export default function TrackRow({
  track,
  isPlaying,
  onPlay,
  onStop,
  userRating,
  volume,
}: TrackRowProps) {
  const { user } = useUser();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!track.previewUrl) return;
    if (isPlaying) onStop();
    else onPlay();
  };

  const handleRate = async (score: number) => {
    if (!user) return;

    const ratingId = `${user.uid}_${track.id}`;

    try {
      await setDoc(
        doc(db, "ratings", ratingId),
        {
          userId: user.uid,
          username: user.username,
          trackId: track.id,
          albumId: track.albumId,
          score: score,
          createdAt: new Date(),
        },
        { merge: true },
      );

      console.log(`Rated ${track.name}: ${score} stars`);
    } catch (error) {
      console.error("Error rating:", error);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className='group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5'>
      <button
        onClick={togglePlay}
        disabled={!track.previewUrl}
        className='w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-purple-500 hover:text-white transition-all text-gray-400'
      >
        {isPlaying ? (
          <Pause size={16} fill='currentColor' />
        ) : (
          <Play size={16} fill='currentColor' className='ml-1' />
        )}
      </button>

      {track.previewUrl && (
        <audio ref={audioRef} src={track.previewUrl} onEnded={onStop} />
      )}

      <div className='flex-1 min-w-0'>
        <h4
          className={`font-medium truncate ${isPlaying ? "text-purple-400" : "text-white"}`}
        >
          {track.name}
        </h4>
        <p className='text-sm text-gray-500 truncate'>{track.artist}</p>
      </div>

      <div className='hidden sm:block'>
        <StarRating initialRating={userRating || 0} onRate={handleRate} />
      </div>

      <div className='text-sm text-gray-600 font-mono w-12 text-right'>
        {formatTime(track.durationMs)}
      </div>
    </div>
  );
}
