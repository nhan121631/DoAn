import { auth } from "@/lib/firebase";
import { signInAnonymously, signInWithCustomToken, User } from "firebase/auth";

/**
 * Sign in user to Firebase using their session ID as custom token
 * This ensures Firebase knows who the user is for Firestore security rules
 */
export const signInToFirebase = async (userId: string): Promise<User | null> => {
  try {
    // For development, we'll use anonymous auth
    // In production, you should use custom tokens from your backend
    const result = await signInAnonymously(auth);
    console.log("Firebase user signed in:", result.user.uid);
    return result.user;
  } catch (error) {
    console.error("Error signing in to Firebase:", error);
    return null;
  }
};

/**
 * Sign out from Firebase
 */
export const signOutFromFirebase = async (): Promise<void> => {
  try {
    await auth.signOut();
    console.log("User signed out from Firebase");
  } catch (error) {
    console.error("Error signing out from Firebase:", error);
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentFirebaseUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Wait for Firebase auth to be ready
 */
export const waitForFirebaseAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};