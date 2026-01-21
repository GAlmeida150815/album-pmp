"use client";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import type { Album } from "@/interfaces/Album";
import Image from "next/image";

export default function AlbumCard({
  album,
  rating,
  onClick,
}: {
  album: Album;
  rating?: number | null;
  onClick?: () => void;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/album/${album.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className='glass group relative overflow-hidden rounded-2xl p-4 transition-all hover:scale-[1.02] hover:shadow-purple-500/10 hover:shadow-2xl cursor-pointer border border-white/5 hover:border-purple-500/30'
    >
      {/* Cover Art */}
      <div className='relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-800 shadow-inner'>
        <Image
          src={album.cover}
          alt={album.title}
          fill
          className='object-cover transition-transform duration-500 group-hover:scale-110'
          sizes='(max-width: 768px) 50vw, 25vw'
          priority={false}
        />
        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10'>
          <Star className='text-white fill-white drop-shadow-lg' size={32} />
        </div>

        {rating !== undefined && rating !== null && (
          <div className='absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg z-20'>
            <Star size={12} className='text-yellow-400 fill-yellow-400' />
            <span className='text-white text-xs font-bold'>
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className='space-y-1'>
        <h3
          className='font-bold text-white truncate text-lg leading-tight'
          title={album.title}
        >
          {album.title}
        </h3>
        <p className='text-gray-400 text-sm truncate' title={album.artist}>
          {album.artist}
        </p>
      </div>

      {/* User Badge */}
      <div className='flex justify-between items-center border-t border-white/10 pt-3 mt-3'>
        <span className='text-[10px] text-gray-500 font-mono uppercase tracking-wider'>
          Sugerido Por
        </span>
        <span className='text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded border border-purple-500/20'>
          {album.submittedBy}
        </span>
      </div>
    </div>
  );
}
