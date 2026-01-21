"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
} from "firebase/firestore";
import {
  Search,
  Loader2,
  ArrowLeft,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AlbumCard from "@/components/AlbumCard";
import type { Album } from "@/interfaces/Album";
import type {
  ItunesResult,
  ItunesCollection,
  ItunesTrack,
} from "@/interfaces/Itunes";
import PageLoader from "@/components/PageLoader";

const ITEMS_PER_PAGE = 4;

export default function AddAlbumPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [queryInput, setQueryInput] = useState("");
  const [results, setResults] = useState<Album[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [existingAlbum, setExistingAlbum] = useState<Album | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const checkLimit = async () => {
      if (!user) return;
      setLoading(true);
      const q = query(
        collection(db, "albums"),
        where("submittedByUid", "==", user.uid),
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setExistingAlbum({ id: snapshot.docs[0].id, ...data } as Album);
      }
      setLoading(false);
    };
    checkLimit();
  }, [user]);

  const handleSearch = async () => {
    if (!queryInput.trim() || !user) return;
    setIsSearching(true);
    setCurrentPage(1); // Reset para a primeira página numa nova pesquisa

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(queryInput)}`,
      );
      const data = await res.json();

      const transformedResults: Album[] = data.map(
        (item: ItunesCollection) => ({
          id: String(item.collectionId),
          appleId: item.collectionId,
          title: item.collectionName,
          artist: item.artistName,
          cover: item.artworkUrl100.replace("100x100", "600x600"),
          submittedBy: user.username,
          submittedByUid: user.uid,
          createdAt: new Date(),
        }),
      );

      setResults(transformedResults);
    } catch (err) {
      console.error(err);
    }
    setIsSearching(false);
  };

  const selectAlbum = async (albumPreview: Album) => {
    if (!user || existingAlbum || isSaving) return;

    setIsSaving(true);

    try {
      const res = await fetch(`/api/lookup?id=${albumPreview.appleId}`);
      const data = await res.json();
      const results = data as {
        results: ItunesResult[];
        tracks: ItunesTrack[];
      };

      const trackData = results.tracks;

      const newAlbumRef = await addDoc(collection(db, "albums"), {
        title: albumPreview.title,
        artist: albumPreview.artist,
        cover: albumPreview.cover,
        appleId: albumPreview.appleId,
        submittedBy: user.username,
        submittedByUid: user.uid,
        createdAt: Timestamp.now(),
      });

      const batch = writeBatch(db);
      trackData.forEach((t) => {
        const trackRef = doc(collection(db, "tracks"));
        batch.set(trackRef, {
          name: t.trackName,
          albumId: newAlbumRef.id,
          appleAlbumId: t.collectionId,
          previewUrl: t.previewUrl || null,
          durationMs: t.trackTimeMillis,
          trackNumber: t.trackNumber,
          artist: t.artistName,
        });
      });
      await batch.commit();
      router.push("/");
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (
      !existingAlbum ||
      !confirm("Tens a certeza? Isto apagará o álbum e todas as faixas.")
    )
      return;
    setIsDeleting(true);

    try {
      const batch = writeBatch(db);

      batch.delete(doc(db, "albums", existingAlbum.id));

      const tracksQ = query(
        collection(db, "tracks"),
        where("albumId", "==", existingAlbum.id),
      );
      const trackSnaps = await getDocs(tracksQ);
      trackSnaps.forEach((t) => batch.delete(t.ref));

      const ratingsQ = query(
        collection(db, "ratings"),
        where("albumId", "==", existingAlbum.id),
      );
      const ratingSnaps = await getDocs(ratingsQ);
      ratingSnaps.forEach((r) => batch.delete(r.ref));

      await batch.commit();

      setExistingAlbum(null);
    } catch (e) {
      console.error(e);
      alert("Não foi possível apagar.");
    }
    setIsDeleting(false);
  };

  // --- Lógica de Paginação ---
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const currentResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  if (loading || userLoading) return <PageLoader />;

  if (existingAlbum) {
    return (
      <div className='min-h-screen bg-black text-white p-6 flex flex-col items-center pt-20'>
        <div className='max-w-md w-full text-center'>
          <h1 className='text-3xl font-bold mb-2'>A Tua Escolha</h1>
          <p className='text-gray-400 mb-8'>Já submeteste um álbum.</p>

          <div className='mx-auto mb-8 max-w-xs transform hover:scale-105 transition-transform'>
            <AlbumCard album={existingAlbum} onClick={() => {}} />
          </div>

          <div className='flex flex-col gap-4'>
            <button
              onClick={() => router.push("/")}
              className='bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors'
            >
              Voltar ao Dashboard
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className='flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 py-3 rounded-xl transition-colors border border-red-500/20'
            >
              {isDeleting ? (
                <Loader2 className='animate-spin' />
              ) : (
                <Trash2 size={20} />
              )}
              Apagar e Escolher Novo Álbum
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black text-white p-6'>
      <div className='max-w-6xl mx-auto'>
        <button
          onClick={() => router.back()}
          className='flex items-center text-gray-400 hover:text-white mb-6'
        >
          <ArrowLeft size={20} className='mr-2' /> Voltar
        </button>

        <h1 className='text-3xl font-bold mb-2'>Escolhe o teu Álbum</h1>
        <p className='text-gray-400 mb-8'>
          Pesquisa na Apple Music. Escolhe com sabedoria.
        </p>

        {/* Barra de Pesquisa */}
        <div className='flex gap-3 mb-10'>
          <div className='relative flex-1'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'
              size={20}
            />
            <input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder='Pesquisar...'
              className='w-full bg-gray-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className='bg-white text-black px-8 rounded-xl font-bold'
          >
            {isSearching ? <Loader2 className='animate-spin' /> : "Pesquisar"}
          </button>
        </div>

        {/* Grelha de Resultados */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12'>
          {currentResults.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              isSelection={true}
              onClick={() => selectAlbum(album)}
            />
          ))}
        </div>

        {/* Paginação */}
        {results.length > ITEMS_PER_PAGE && (
          <div className='flex justify-center items-center gap-6 pb-20'>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className='p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
            >
              <ChevronLeft size={24} />
            </button>

            <span className='font-mono text-gray-400'>
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className='p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
