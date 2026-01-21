"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { LogOut, PlusCircle, Music2, BarChart3 } from "lucide-react";
import AlbumCard from "../components/AlbumCard";
import type { Album } from "@/interfaces/Album";
import PageLoader from "@/components/PageLoader";
import type { Rating } from "@/interfaces/Rating";

export default function Dashboard() {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const albumQ = query(
      collection(db, "albums"),
      orderBy("createdAt", "desc"),
    );
    const unsubAlbums = onSnapshot(albumQ, (snapshot) => {
      const docs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Album,
      );
      setAlbums(docs);
    });

    const ratingQ = query(collection(db, "ratings"));
    const unsubRatings = onSnapshot(ratingQ, (snapshot) => {
      const docs = snapshot.docs.map((doc) => doc.data() as Rating);
      setRatings(docs);
      setDataLoading(false);
    });

    return () => {
      unsubAlbums();
      unsubRatings();
    };
  }, [user]);

  const getAlbumMedian = (albumId: string) => {
    const albumRatings = ratings
      .filter((r) => r.albumId === albumId)
      .map((r) => r.score);

    if (albumRatings.length === 0) return null;
    const sum = albumRatings.reduce((acc, curr) => acc + curr, 0);
    return sum / albumRatings.length;
  };

  if (loading || !user || dataLoading) return <PageLoader />;

  return (
    <div className='min-h-screen bg-black pb-20'>
      <header className='sticky top-0 z-50 glass border-b border-white/10 px-6 py-4 flex justify-between items-center'>
        <div>
          <h1 className='text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent'>
            Album PMP
          </h1>
          <p className='text-xs text-gray-400'>Bem-vindo, {user.username}</p>
        </div>
        <div className='flex gap-3'>
          <button
            onClick={() => router.push("/statistics")}
            className='p-2 hover:bg-white/10 rounded-full transition-colors text-purple-400 hover:text-white border border-transparent hover:border-purple-500/50'
            title='View Stats'
          >
            <BarChart3 size={20} />
          </button>
          <button
            onClick={() => router.push("/add-album")}
            className='flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors'
          >
            <PlusCircle size={18} />
            <span className='hidden sm:inline'>Adicionar Álbum</span>
          </button>

          <button
            onClick={logout}
            className='p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white'
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className='p-6 max-w-7xl mx-auto'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='p-3 bg-purple-500/20 rounded-xl text-purple-400'>
            <Music2 size={24} />
          </div>
          <h2 className='text-2xl font-bold text-white'>Rotação do Grupo</h2>
        </div>

        {albums.length === 0 ? (
          <div className='text-center py-20 opacity-50'>
            <Music2 size={64} className='mx-auto mb-4 text-gray-600' />
            <p className='text-xl'>No albums yet.</p>
            <p className='text-sm text-gray-500'>
              Sê o primeiro a adicionar uma bomba.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                rating={getAlbumMedian(album.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
