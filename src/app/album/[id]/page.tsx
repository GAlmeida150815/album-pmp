"use client";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { ArrowLeft, User, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TrackRow from "@/components/TrackRow";
import { useUser } from "@/context/UserContext";
import type { Album } from "@/interfaces/Album";
import type { Track } from "@/interfaces/Track";
import PageLoader from "@/components/PageLoader";
import VolumeSlider from "@/components/VolumeSlider";

export default function AlbumDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [volume, setVolume] = useState(0.5);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (userLoading) return;

      try {
        const albumSnap = await getDoc(doc(db, "albums", id));
        if (!albumSnap.exists()) {
          router.push("/");
          return;
        }
        setAlbum({ id: albumSnap.id, ...albumSnap.data() } as Album);

        const tracksQuery = query(
          collection(db, "tracks"),
          where("albumId", "==", id),
          orderBy("trackNumber", "asc"),
        );
        const trackSnaps = await getDocs(tracksQuery);
        const trackList = trackSnaps.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Track,
        );
        setTracks(trackList);

        if (user) {
          const ratingsQuery = query(
            collection(db, "ratings"),
            where("albumId", "==", id),
            where("username", "==", user.username),
          );
          const ratingSnaps = await getDocs(ratingsQuery);
          const ratingMap: Record<string, number> = {};
          ratingSnaps.forEach((doc) => {
            const data = doc.data();
            ratingMap[data.trackId] = data.score;
          });
          setUserRatings(ratingMap);
        }
      } catch (error) {
        console.error("Error fetching album:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, user, router, userLoading]);

  if (loading || userLoading || !album) {
    return <PageLoader />;
  }

  return (
    <div className='min-h-screen bg-black text-white pb-20 relative overflow-hidden'>
      <div className='absolute top-0 left-0 w-full h-[500px] opacity-20 pointer-events-none'>
        <Image
          src={album.cover}
          alt='bg'
          fill
          className='object-cover blur-3xl mask-gradient-to-b'
        />
        <div className='absolute inset-0 bg-gradient-to-b from-transparent to-black' />
      </div>

      <div className='relative z-10 max-w-5xl mx-auto p-6'>
        {/* --- HEADER --- */}
        <button
          onClick={() => router.back()}
          className='flex items-center text-gray-400 hover:text-white mb-8 transition-colors group'
        >
          <ArrowLeft
            size={20}
            className='mr-2 group-hover:-translate-x-1 transition-transform'
          />
          Voltar à Coleção
        </button>

        <div className='flex flex-col md:flex-row gap-8 mb-12 items-center md:items-end'>
          {/* Cover Art */}
          <div className='relative w-64 h-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-white/10 group'>
            <Image
              src={album.cover}
              alt={album.title}
              fill
              className='object-cover'
              priority
            />
          </div>

          {/* Info */}
          <div className='flex-1 text-center md:text-left space-y-4'>
            <h1 className='text-4xl md:text-6xl font-black tracking-tight leading-tight'>
              {album.title}
            </h1>
            <p className='text-2xl text-gray-400 font-medium'>{album.artist}</p>

            <div className='flex flex-wrap gap-4 justify-center md:justify-start pt-2'>
              <div className='flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5'>
                <User size={16} className='text-purple-400' />
                <span className='text-sm font-bold text-gray-300'>
                  Sugerido por {album.submittedBy}
                </span>
              </div>
              <div className='flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5'>
                <Clock size={16} className='text-pink-400' />
                <span className='text-sm text-gray-300'>
                  {tracks.length} Músicas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- TRACKLIST --- */}
        <div className='glass rounded-2xl p-2 md:p-6 border border-white/5'>
          <div className='flex items-center justify-between px-4 pb-4 border-b border-white/5 text-xs font-mono uppercase text-gray-500 tracking-wider mb-2'>
            <span>Faixa</span>
            <div className='flex gap-12'>
              <span className='hidden sm:block'>A Tua Avaliação</span>
              <span>Duração</span>
            </div>
          </div>

          <div className='space-y-1'>
            {tracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                userRating={userRatings[track.id]}
                isPlaying={playingTrackId === track.id}
                onPlay={() => setPlayingTrackId(track.id)}
                onStop={() => setPlayingTrackId(null)}
                volume={volume}
              />
            ))}
          </div>

          {tracks.length === 0 && (
            <div className='text-center py-10 text-gray-500'>
              Não foram encontradas faixas para este álbum.
            </div>
          )}
        </div>
      </div>

      <VolumeSlider volume={volume} onVolumeChange={setVolume} />
    </div>
  );
}
