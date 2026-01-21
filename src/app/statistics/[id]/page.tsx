"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ArrowLeft, Trophy, Star, TrendingUp, Music } from "lucide-react";
import Image from "next/image";
import PageLoader from "@/components/PageLoader";
import type { Album } from "@/interfaces/Album";
import type { Track } from "@/interfaces/Track";
import type { Rating } from "@/interfaces/Rating";
import StarRating from "@/components/StarRating";

interface RankedTrack extends Track {
  starScore: number;
  averageScore: number;
  voteCount: number;
}

export default function AlbumStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [album, setAlbum] = useState<Album | null>(null);
  const [rankedTracks, setRankedTracks] = useState<RankedTrack[]>([]);
  const [albumAverage, setAlbumAverage] = useState(0);
  const [bestSong, setBestSong] = useState<RankedTrack | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const albumSnap = await getDoc(doc(db, "albums", id));
        if (!albumSnap.exists()) {
          router.push("/statistics");
          return;
        }
        const albumData = { id: albumSnap.id, ...albumSnap.data() } as Album;
        setAlbum(albumData);

        const [tracksSnap, ratingsSnap] = await Promise.all([
          getDocs(query(collection(db, "tracks"), where("albumId", "==", id))),
          getDocs(query(collection(db, "ratings"), where("albumId", "==", id))),
        ]);

        const tracks = tracksSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Track,
        );
        const ratings = ratingsSnap.docs.map((d) => d.data() as Rating);

        let totalScoreSum = 0;
        let totalVotes = 0;

        const processedTracks: RankedTrack[] = tracks.map((track) => {
          const trackRatings = ratings.filter((r) => r.trackId === track.id);

          if (trackRatings.length === 0) {
            return { ...track, starScore: 0, averageScore: 0, voteCount: 0 };
          }

          const sum = trackRatings.reduce((acc, curr) => acc + curr.score, 0);
          const avg = sum / trackRatings.length;
          const stars = Math.round(avg * 2) / 2;

          totalScoreSum += sum;
          totalVotes += trackRatings.length;

          return {
            ...track,
            starScore: stars,
            averageScore: avg,
            voteCount: trackRatings.length,
          };
        });

        processedTracks.sort((a, b) => b.averageScore - a.averageScore);

        setRankedTracks(processedTracks);
        if (processedTracks.length > 0) {
          setBestSong(processedTracks[0]);
        }

        setAlbumAverage(totalVotes > 0 ? totalScoreSum / totalVotes : 0);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  if (loading || !album) return <PageLoader />;

  return (
    <div className='min-h-screen bg-black text-white p-6 pb-20 relative overflow-hidden'>
      {/* Background Ambience */}
      <div className='absolute top-0 left-0 w-full h-[500px] opacity-20 pointer-events-none'>
        <Image
          src={album.cover}
          alt='bg'
          fill
          className='object-cover blur-3xl mask-gradient-to-b'
        />
        <div className='absolute inset-0 bg-gradient-to-b from-transparent to-black' />
      </div>

      <div className='relative z-10 max-w-4xl mx-auto space-y-10'>
        {/* Nav */}
        <button
          onClick={() => router.back()}
          className='flex items-center text-gray-400 hover:text-white transition-colors mb-4'
        >
          <ArrowLeft size={20} className='mr-2' /> Voltar às Estatísticas
        </button>

        {/* 1. HEADER & ALBUM SCORE */}
        <div className='flex flex-col md:flex-row gap-8 items-center md:items-end'>
          <div className='relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10'>
            <Image
              src={album.cover}
              alt={album.title}
              fill
              className='object-cover'
            />
          </div>

          <div className='text-center md:text-left flex-1'>
            <h1 className='text-4xl md:text-5xl font-black mb-2 leading-tight'>
              {album.title}
            </h1>
            <p className='text-xl text-gray-400 mb-6'>{album.artist}</p>

            <div className='flex flex-col md:flex-row items-center gap-6'>
              {/* Big Score Badge */}
              <div className='flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md'>
                <Star className='text-yellow-500 fill-yellow-500' size={32} />
                <div>
                  <div className='text-3xl font-bold'>
                    {albumAverage.toFixed(2)}
                  </div>
                  <div className='text-xs text-gray-400 uppercase tracking-wider font-bold'>
                    Média do Álbum
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2 text-gray-400 text-sm'>
                <TrendingUp size={16} />
                <span>
                  Baseado em{" "}
                  {rankedTracks.reduce((acc, t) => acc + t.voteCount, 0)} votos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. THE CHAMPION */}
        {bestSong && bestSong.voteCount > 0 && (
          <section className='relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-black border border-yellow-500/30 p-8 shadow-2xl'>
            <div className='absolute top-0 right-0 p-4 opacity-10'>
              <Trophy size={180} />
            </div>

            <div className='relative z-10'>
              <div className='flex items-center gap-2 text-yellow-500 font-bold uppercase tracking-widest text-xs mb-3'>
                <Trophy size={14} /> Favorita dos Fãs
              </div>
              <h2 className='text-3xl md:text-4xl font-black mb-2'>
                {bestSong.name}
              </h2>
              <p className='text-gray-400 mb-6'>
                A faixa com melhor classificação neste álbum.
              </p>

              <div className='inline-block bg-yellow-500 text-black px-4 py-1 rounded-full font-bold text-lg'>
                {bestSong.averageScore.toFixed(2)} / 5.0
              </div>
            </div>
          </section>
        )}

        {/* 3. RANKED TRACKLIST */}
        <section>
          <div className='flex items-center gap-3 mb-6'>
            <Music className='text-purple-500' />
            <h2 className='text-2xl font-bold'>Ranking das Faixas</h2>
          </div>

          <div className='space-y-3'>
            {rankedTracks.map((track, index) => (
              <div
                key={track.id}
                className='group flex items-center gap-4 p-4 rounded-xl glass hover:bg-white/10 transition-colors border border-white/5'
              >
                {/* Rank */}
                <div
                  className={`text-xl font-bold w-8 text-center ${
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

                {/* Track Info */}
                <div className='flex-1 min-w-0'>
                  <div className='font-bold text-lg truncate text-white'>
                    {track.name}
                  </div>
                  {/* Star Rating for Score */}
                  <div className='w-full max-w-[200px] rounded-full mt-2 '>
                    <StarRating
                      initialRating={track.starScore}
                      onRate={() => {}}
                      readOnly={true}
                    />
                  </div>
                </div>

                {/* Score */}
                <div className='text-right'>
                  <div
                    className={`text-xl font-bold ${
                      track.voteCount === 0 ? "text-gray-600" : "text-white"
                    }`}
                  >
                    {track.voteCount > 0 ? track.averageScore.toFixed(1) : "-"}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {track.voteCount} votos
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
