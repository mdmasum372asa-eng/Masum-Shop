import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const PRIMARY_ADMIN_EMAIL = 'mdmasum372asa@gmail.com';
const BOOTSTRAP_ADMIN_EMAIL = 'lxm88821@gmail.com';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerAdminAccount: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  primaryAdminEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminPrivilege = async (user: User | null): Promise<boolean> => {
    if (!user || !user.email) return false;
    const email = user.email.toLowerCase().trim();
    const isSpecialEmail =
      email === PRIMARY_ADMIN_EMAIL.toLowerCase() || email === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

    if (isSpecialEmail) {
      // Ensure record in admins/{uid} for Firestore rules lookup
      try {
        await setDoc(
          doc(db, 'admins', user.uid),
          {
            email: user.email,
            role: 'admin',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Admin record sync notice:', err);
      }
      return true;
    }

    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      return adminDoc.exists();
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const adminStatus = await checkAdminPrivilege(user);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    const cleanEmail = email.trim();
    // Do NOT modify or trim pass so exact special characters are passed verbatim
    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const adminStatus = await checkAdminPrivilege(result.user);
      setIsAdmin(adminStatus);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };

      // If user is not yet created in the freshly provisioned Firebase Authentication,
      // and it's the designated admin email, auto-create the account with the provided password
      const isTargetAdmin =
        cleanEmail.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
        cleanEmail.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      if (
        isTargetAdmin &&
        (firebaseError.code === 'auth/user-not-found' ||
          firebaseError.code === 'auth/invalid-credential' ||
          firebaseError.code === 'auth/invalid-login-credentials')
      ) {
        try {
          const createResult = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          const adminStatus = await checkAdminPrivilege(createResult.user);
          setIsAdmin(adminStatus);
          return;
        } catch (createErr: unknown) {
          const createFbErr = createErr as { code?: string };
          // If the email already exists in Auth, then it truly was an incorrect password
          if (createFbErr.code === 'auth/email-already-in-use') {
            const msg = 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
            setError(msg);
            throw new Error(msg);
          }
        }
      }

      let msg = 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
      if (firebaseError.code === 'auth/invalid-email') {
        msg = 'ইমেইল অ্যাড্রেসের ফরম্যাট সঠিক নয়।';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        msg = 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সাময়িকভাবে বন্ধ রাখা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const registerAdminAccount = async (email: string, pass: string) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const adminStatus = await checkAdminPrivilege(result.user);
      setIsAdmin(adminStatus);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      let msg = 'অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে।';
      if (firebaseError.code === 'auth/email-already-in-use') {
        msg = 'এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে। সরাসরি লগইন করুন।';
      } else if (firebaseError.code === 'auth/weak-password') {
        msg = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('অনুগ্রহ করে আপনার ইমেইল অ্যাড্রেসটি লিখুন।');
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      // Report syntax/rate-limiting errors accurately, but NEVER expose if user exists or not
      if (fbErr.code === 'auth/invalid-email') {
        throw new Error('ইমেইল অ্যাড্রেসের ফরম্যাট সঠিক নয়।');
      }
      if (fbErr.code === 'auth/too-many-requests') {
        throw new Error('অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।');
      }
      // For auth/user-not-found, auth/missing-email, or other existence checks,
      // silently absorb the error so attacker cannot probe or enumerate email addresses.
      console.info('Password reset request completed without exposing email validity.');
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const adminStatus = await checkAdminPrivilege(result.user);
      setIsAdmin(adminStatus);
    } catch (err: unknown) {
      const msg = 'গুগল সাইন-ইন সম্পন্ন করা যায়নি।';
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAdmin(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        loginWithEmail,
        registerAdminAccount,
        resetPassword,
        loginWithGoogle,
        logout,
        error,
        clearError: () => setError(null),
        primaryAdminEmail: PRIMARY_ADMIN_EMAIL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
