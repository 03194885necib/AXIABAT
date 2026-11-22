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

const PROFILE_ERROR_MESSAGES = {
  "profile/permission-denied":
    "Firebase Auth a accepté la connexion, mais Firestore refuse la lecture de users/{UID}. Vérifiez les règles publiées.",
  "profile/read-failed":
    "Impossible de lire le profil Firestore de ce compte.",
  "profile/not-found":
    "Aucun document users/{UID} ne correspond à cet utilisateur.",
  "profile/invalid-role":
    "Le profil Firestore contient un rôle non reconnu.",
  "profile/invalid-active-status":
    "Le champ users/{UID}.actif doit être un booléen.",
  "auth/account-disabled":
    "Ce compte est désactivé. Contactez un administrateur.",
};

export function getLoginErrorMessage(errorOrCode) {
  const code =
    typeof errorOrCode === "string" ? errorOrCode : errorOrCode?.code;
  return PROFILE_ERROR_MESSAGES[code] || "Email ou mot de passe incorrect.";
}

function profileError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

async function readUserProfile(uid) {
  let snap;
  try {
    snap = await getDoc(doc(db, "users", uid));
  } catch (error) {
    throw profileError(
      error?.code === "permission-denied"
        ? "profile/permission-denied"
        : "profile/read-failed"
    );
  }

  if (!snap.exists()) {
    throw profileError("profile/not-found");
  }

  const profile = snap.data();
  if (!Object.values(ROLES).includes(profile.role)) {
    throw profileError("profile/invalid-role");
  }
  if (typeof profile.actif !== "boolean") {
    throw profileError("profile/invalid-active-status");
  }
  if (profile.actif !== true) {
    throw profileError("auth/account-disabled");
  }

  return profile;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    setAuthError(null);
    setUserProfile(null);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    try {
      const profile = await readUserProfile(credential.user.uid);
      setUserProfile(profile);
      return credential;
    } catch (error) {
      setCurrentUser(null);
      setUserProfile(null);
      setAuthError(error.code || "profile/read-failed");
      try {
        await signOut(auth);
      } catch {
        // Keep the app profile cleared even if Auth cleanup fails.
      }
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setAuthError(null);
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
      setLoading(true);
      try {
        setCurrentUser(user);
        if (!user) {
          setUserProfile(null);
          return;
        }

        setAuthError(null);
        const profile = await readUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        setCurrentUser(null);
        setUserProfile(null);
        setAuthError(error.code || "profile/read-failed");
        try {
          await signOut(auth);
        } catch {
          // The provider remains unauthenticated even if SDK cleanup fails.
        }
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    authError,
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
