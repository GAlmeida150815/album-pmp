import { Timestamp } from "firebase/firestore";

export interface Album {
  id: string;
  appleId: number;
  title: string;
  artist: string;
  cover: string;
  artworkUrl100?: string;

  submittedBy: string;
  submittedByUid: string;

  createdAt: Timestamp | Date;
}
