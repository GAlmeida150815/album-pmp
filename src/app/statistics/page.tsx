"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { ArrowLeft, Trophy, Disc, Music, Crown } from "lucide-react";
import Image from "next/image";
import PageLoader from "@/components/PageLoader";
import type { Album } from "@/interfaces/Album";
import type { Track } from "@/interfaces/Track";
import type { Rating } from "@/interfaces/Rating";

interface RankedAlbum extends Album {
  averageScore: number;
  voteCount: number;
}

interface RankedTrack extends Track {
  averageScore: number;
  voteCount: number;
  cover: string;
}

export default function StatisticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [topAlbums, setTopAlbums] = useState<RankedAlbum[]>([]);
  const [bestSong, setBestSong] = useState<RankedTrack | null>(null);
  const [masterpieces, setMasterpieces] = useState<RankedAlbum[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumsSnap, tracksSnap, ratingsSnap] = await Promise.all([
          getDocs(collection(db, "albums")),
          getDocs(collection(db, "tracks")),
          getDocs(collection(db, "ratings")),
        ]);

        const albums = albumsSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Album,
        );
        const tracks = tracksSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Track,
        );
        const ratings = ratingsSnap.docs.map((d) => d.data() as Rating);

        if (ratings.length === 0) {
          setLoading(false);
          return;
        }

        const calcAvg = (items: Rating[]) => {
          const sum = items.reduce((acc, curr) => acc + curr.score, 0);
          return sum / items.length;
        };

        const processedAlbums: RankedAlbum[] = albums
          .map((album) => {
            const albumRatings = ratings.filter((r) => r.albumId === album.id);
            return {
              ...album,
              averageScore: albumRatings.length > 0 ? calcAvg(albumRatings) : 0,
              voteCount: albumRatings.length,
            };
          })
          .filter((a) => a.voteCount > 0)
          .sort((a, b) => b.averageScore - a.averageScore);

        const processedTracks = tracks
          .map((track) => {
            const trackRatings = ratings.filter((r) => r.trackId === track.id);
            const parentAlbum = albums.find((a) => a.id === track.albumId);

            return {
              ...track,
              cover: parentAlbum?.cover || "",
              averageScore: trackRatings.length > 0 ? calcAvg(trackRatings) : 0,
              voteCount: trackRatings.length,
            } as RankedTrack;
          })
          .filter((t) => t.voteCount > 0)
          .sort((a, b) => b.averageScore - a.averageScore);

        if (processedTracks.length > 0) {
          setBestSong(processedTracks[0]);
        }

        const masterpieceAlbumIds = new Set(
          processedTracks
            .filter((t) => t.averageScore >= 4.5)
            .map((t) => t.albumId),
        );
        const masterpieceList = processedAlbums.filter((album) =>
          masterpieceAlbumIds.has(album.id),
        );

        setTopAlbums(processedAlbums);
        setMasterpieces(masterpieceList);
      } catch (error) {
        console.error("Stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className='min-h-screen bg-black text-white p-6 pb-20'>
      <div className='max-w-4xl mx-auto space-y-12'>
        {/* Header */}
        <button
          onClick={() => router.back()}
          className='flex items-center text-gray-400 hover:text-white transition-colors mb-6'
        >
          <ArrowLeft size={20} className='mr-2' /> Voltar ao Dashboard
        </button>

        <header>
          <h1 className='text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent inline-block'>
            Hall of Fame
          </h1>
          <p className='text-gray-400'>Os números não mentem.</p>
        </header>

        {/* 1. BEST RATED SONG */}
        {bestSong && (
          <section className='relative overflow-hidden rounded-3xl bg-gray-900 border border-yellow-500/30 p-8 shadow-2xl shadow-yellow-900/20'>
            <div className='absolute top-0 right-0 p-4 opacity-10'>
              <Trophy size={200} />
            </div>

            <div className='relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8'>
              <div className='relative w-40 h-40 shrink-0'>
                <Image
                  src={bestSong.cover}
                  alt={bestSong.name}
                  fill
                  className='rounded-full border-4 border-yellow-500 object-cover shadow-lg animate-spin-slow' // animate-spin-slow needs custom CSS or just use standard
                />
                <div className='absolute -bottom-2 -right-2 bg-yellow-500 text-black p-2 rounded-full border-4 border-black'>
                  <Crown size={24} fill='black' />
                </div>
              </div>

              <div className='text-center md:text-left'>
                <div className='text-yellow-500 font-bold tracking-widest uppercase mb-2 text-sm'>
                  Música Mais Bem Classificada
                </div>
                <h2 className='text-3xl md:text-5xl font-black leading-tight mb-2'>
                  {bestSong.name}
                </h2>
                <p className='text-xl text-gray-400 mb-6'>{bestSong.artist}</p>

                <div className='inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-6 py-3 rounded-full'>
                  <span className='text-3xl font-bold text-yellow-500'>
                    {bestSong.averageScore.toFixed(1)}
                  </span>
                  <span className='text-xs text-yellow-500/70 uppercase font-bold mt-2'>
                    / 5.0
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. TOP ALBUMS */}
        <section>
          <div className='flex items-center gap-3 mb-6'>
            <Disc className='text-purple-500' />
            <h2 className='text-2xl font-bold'>Rankings de Álbuns</h2>
          </div>

          <div className='space-y-4'>
            {topAlbums.map((album, index) => (
              <div
                key={album.id}
                onClick={() => router.push(`/statistics/${album.id}`)}
                className='group flex items-center gap-6 p-4 rounded-2xl glass hover:bg-white/10 transition-all cursor-pointer border border-white/5 hover:border-purple-500/30'
              >
                {/* Rank Number */}
                <div
                  className={`text-2xl font-black w-8 text-center ${
                    index === 0
                      ? "text-yellow-400"
                      : index === 1
                        ? "text-gray-300"
                        : index === 2
                          ? "text-orange-400"
                          : "text-gray-600"
                  }`}
                >
                  #{index + 1}
                </div>

                {/* Cover */}
                <div className='relative w-16 h-16 rounded-lg overflow-hidden shrink-0'>
                  <Image
                    src={album.cover}
                    alt='cover'
                    fill
                    className='object-cover'
                  />
                </div>

                {/* Info */}
                <div className='flex-1 min-w-0'>
                  <h3 className='font-bold text-lg truncate group-hover:text-purple-400 transition-colors'>
                    {album.title}
                  </h3>
                  <p className='text-sm text-gray-400 truncate'>
                    {album.artist}
                  </p>
                </div>

                {/* Score */}
                <div className='text-right'>
                  <div className='text-xl font-bold'>
                    {album.averageScore.toFixed(1)}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {album.voteCount} votos
                  </div>
                </div>
              </div>
            ))}

            {topAlbums.length === 0 && (
              <p className='text-gray-500 text-center py-10'>
                Ainda sem álbuns avaliados.
              </p>
            )}
          </div>
        </section>

        {/* 3. MASTERPIECES */}
        {masterpieces.length > 0 && (
          <section>
            <div className='flex items-center gap-3 mb-6 mt-12'>
              <Music className='text-pink-500' />
              <h2 className='text-2xl font-bold'>Obras-Primas Certificadas</h2>
              <span className='text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded border border-pink-500/20'>
                Tem Música 4.5+
              </span>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {masterpieces.map((album) => (
                <div
                  key={album.id}
                  onClick={() => router.push(`/statistics/${album.id}`)}
                  className='relative aspect-square rounded-xl overflow-hidden border border-pink-500/30 shadow-2xl shadow-pink-900/20 cursor-pointer hover:scale-105 transition-transform'
                >
                  <Image
                    src={album.cover}
                    alt='art'
                    fill
                    className='object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-4'>
                    <div>
                      <p className='font-bold text-white text-sm truncate'>
                        {album.title}
                      </p>
                      <p className='text-pink-400 text-xs font-bold'>
                        Média do Álbum: {album.averageScore.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
