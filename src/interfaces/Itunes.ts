export interface ItunesCollection {
  wrapperType: "collection";
  collectionType: "Album";
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  trackCount: number;
  primaryGenreName: string;
}

export interface ItunesTrack {
  wrapperType: "track";
  kind: "song";
  artistId?: number;
  collectionId: number;
  trackId: number;
  artistName: string;
  trackName: string;
  trackCensoredName: string;
  trackViewUrl: string;
  previewUrl?: string;
  artworkUrl30?: string;
  trackPrice?: number;
  releaseDate: string;
  trackExplicitness: "explicit" | "notExplicit" | "cleaned";
  trackTimeMillis: number;
  trackNumber: number;
  isStreamable?: boolean;
}

export type ItunesResult = ItunesCollection | ItunesTrack;
