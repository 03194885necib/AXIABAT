import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: "admin",
  CHEF_PROJET: "chef_projet",
  CONDUCTEUR: "conducteur",
  VIEWER: "viewer",
};

export const ROLE_LABELS = {
  admin: "Administrateur",
  chef_projet: "Chef de Projet",
  conducteur: "Conducteur de Travaux",
  viewer: "Lecteur",
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", credential.user.uid));
    // Block inactive accounts immediately after sign-in
    if (snap.exists() && snap.data().actif === false) {
      await signOut(auth);
      const err = new Error("Compte désactivé. Contactez un administrateur.");
      err.code = "auth/account-disabled";
      throw err;
    }
    if (snap.exists()) setUserProfile(snap.data());
    return credential;
  };

  const logout = () => {
    setUserProfile(null);
    return signOut(auth);
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const updateUserProfile = async (displayName) => {
    await updateProfile(auth.currentUser, { displayName });
    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      { displayName, updatedAt: serverTimestamp() },
      { merge: true }
    );
    setUserProfile((prev) => ({ ...prev, displayName }));
  };

  const changePassword = async (currentPassword, newPassword) => {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  const hasRole = (role) => userProfile?.role === role;
  const isAdmin = () => userProfile?.role === ROLES.ADMIN;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Re-check actif on every auth state change (e.g. page reload)
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          if (snap.data().actif === false) {
            // Deactivated while session was open — sign out
            await signOut(auth);
            setUserProfile(null);
            setLoading(false);
            return;
          }
          setUserProfile(snap.data());
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    hasRole,
    isAdmin,
    ROLES,
    ROLE_LABELS,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit etre utilise dans AuthProvider");
  return context;
}
