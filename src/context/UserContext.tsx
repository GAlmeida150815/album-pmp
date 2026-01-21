"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import type { UserContextType, AppUser } from "@/interfaces/User";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.displayName) {
        setUser({
          uid: firebaseUser.uid,
          username: firebaseUser.displayName,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginAsGuest = async (username: string) => {
    try {
      const result = await signInAnonymously(auth);
      const newUid = result.user.uid;

      await updateProfile(result.user, { displayName: username });

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const oldUserDoc = snapshot.docs[0];
        const oldUid = oldUserDoc.data().uid;

        if (oldUid !== newUid) {
          const batch = writeBatch(db);

          const albumQ = query(
            collection(db, "albums"),
            where("submittedByUid", "==", oldUid),
          );
          const albums = await getDocs(albumQ);
          albums.forEach((doc) => {
            batch.update(doc.ref, { submittedByUid: newUid });
          });

          batch.delete(doc(db, "users", oldUserDoc.id));
          batch.set(doc(db, "users", newUid), {
            username: username,
            uid: newUid,
            lastLogin: new Date(),
          });

          await batch.commit();
        }
      } else {
        await setDoc(doc(db, "users", newUid), {
          username: username,
          uid: newUid,
          lastLogin: new Date(),
        });
      }

      setUser({ uid: newUid, username: username });
      router.push("/");
    } catch (err) {
      console.error("Error logging in as guest:", err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/login");
  };

  return (
    <UserContext.Provider value={{ user, loading, loginAsGuest, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
