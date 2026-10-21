import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db } from "../firebase";
import { ROLES, useAuth } from "../context/AuthContext";

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
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);
  const [activityLogsError, setActivityLogsError] = useState(null);

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

  const fetchActivityLogs = async () => {
    setActivityLogsLoading(true);
    setActivityLogsError(null);
    try {
      const logsQuery = query(
        collection(db, "logs_activite"),
        orderBy("date", "desc")
      );
      const snap = await getDocs(logsQuery);
      setActivityLogs(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
    } catch (err) {
      console.error("Erreur lors du chargement du journal d'activité :", err);
      setActivityLogsError("Le journal d'activité ne peut pas être chargé.");
    } finally {
      setActivityLogsLoading(false);
    }
  };

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
    if (!currentUser) {
      return { success: false, error: "Session administrateur introuvable." };
    }
    if (currentUser.uid === uid) {
      return { success: false, error: "Vous ne pouvez pas modifier votre propre rôle." };
    }
    if (!Object.values(ROLES).includes(newRole)) {
      return { success: false, error: "Le rôle sélectionné n'est pas valide." };
    }

    try {
      const targetUser = users.find((user) => user.id === uid);
      const batch = writeBatch(db);
      batch.update(doc(db, "users", uid), {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(collection(db, "logs_activite")), {
        uid: currentUser.uid,
        action: "ROLE_CHANGED",
        date: serverTimestamp(),
        détail: {
          targetUid: uid,
          previousRole: targetUser?.role || null,
          newRole,
        },
      });
      await batch.commit();
      setUsers((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, role: newRole } : u))
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const toggleUserStatus = async (uid, currentStatus) => {
    if (!currentUser) {
      return { success: false, error: "Session administrateur introuvable." };
    }
    if (currentUser.uid === uid) {
      return { success: false, error: "Vous ne pouvez pas modifier l'état de votre propre compte." };
    }

    try {
      const batch = writeBatch(db);
      const newStatus = !currentStatus;
      batch.update(doc(db, "users", uid), {
        actif: newStatus,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(collection(db, "logs_activite")), {
        uid: currentUser.uid,
        action: newStatus ? "ACCOUNT_ACTIVATED" : "ACCOUNT_DEACTIVATED",
        date: serverTimestamp(),
        détail: {
          targetUid: uid,
          actif: newStatus,
        },
      });
      await batch.commit();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === uid ? { ...u, actif: newStatus } : u
        )
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteUser = async (uid) => {
    if (!currentUser) {
      return { success: false, error: "Session administrateur introuvable." };
    }
    if (currentUser.uid === uid) {
      return { success: false, error: "Vous ne pouvez pas supprimer votre propre compte." };
    }

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
    activityLogs,
    activityLogsLoading,
    activityLogsError,
    fetchUsers,
    fetchActivityLogs,
    createUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
  };
}
