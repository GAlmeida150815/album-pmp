export interface Track {
  id: string;
  albumId: string;
  appleAlbumId: number;
  name: string;
  artist: string;
  trackNumber: number;
  durationMs: number;
  previewUrl: string | null;
}
