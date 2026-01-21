"use client";
import { Volume2, Volume1, VolumeX } from "lucide-react";

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (val: number) => void;
}

export default function VolumeSlider({
  volume,
  onVolumeChange,
}: VolumeSliderProps) {
  const Icon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className='fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 glass rounded-full shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-4'>
      <button
        onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
        className='text-white hover:text-purple-400 transition-colors'
      >
        <Icon size={20} />
      </button>

      <input
        type='range'
        min='0'
        max='1'
        step='0.01'
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className='w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400'
      />
    </div>
  );
}
