import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "../firebase";
import { ROLES } from "../context/AuthContext";

// ---------------------------------------------------------------------------
// Secondary Firebase app — used for admin-side user creation so the current
// admin session is never displaced by signing in as the newly created user.
// ---------------------------------------------------------------------------
let secondaryApp;
let secondaryAuth;

const initSecondary = () => {
  if (!secondaryApp) {
    // Reuse the same config as the primary app
    const primaryApp = getApps().find((a) => a.name === "[DEFAULT]");
    const config = primaryApp.options;
    secondaryApp = initializeApp(config, "secondary");
    secondaryAuth = getAuth(secondaryApp);
  }
  return secondaryAuth;
};

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const createUser = async ({ email, password, displayName, role, poste }) => {
    try {
      // Use secondary auth instance — never touches the admin's session
      const sAuth = initSecondary();
      const credential = await createUserWithEmailAndPassword(sAuth, email, password);
      const uid = credential.user.uid;
      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        displayName,
        role: role || ROLES.VIEWER,
        poste: poste || "",
        actif: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // Sign out of secondary app immediately to clean up
      await signOut(sAuth);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateUserRole = async (uid, newRole) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, role: newRole } : u))
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const toggleUserStatus = async (uid, currentStatus) => {
    try {
      await updateDoc(doc(db, "users", uid), {
        actif: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === uid ? { ...u, actif: !currentStatus } : u
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteUser = async (uid) => {
    try {
      await deleteDoc(doc(db, "users", uid));
      setUsers((prev) => prev.filter((u) => u.id !== uid));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
  };
}
