import { Timestamp } from "firebase/firestore";

export interface Rating {
  userId: string;
  username: string;
  trackId: string;
  albumId: string;
  score: number;
  createdAt: Timestamp | Date;
}
