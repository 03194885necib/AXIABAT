import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { app, auth, db } from "../firebase";
import { ROLES, useAuth } from "../context/AuthContext";

const PASSWORD_CHARSETS = [
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "abcdefghijkmnopqrstuvwxyz",
  "23456789",
  "!@#$%^&*()-_=+[]{}:,.?",
];

function secureRandomIndex(max) {
  const cryptoApi = typeof window !== "undefined" ? window.crypto : undefined;
  if (!cryptoApi?.getRandomValues) {
    const error = new Error("secure-random-unavailable");
    error.code = "secure-random-unavailable";
    throw error;
  }

  const randomValue = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  do {
    cryptoApi.getRandomValues(randomValue);
  } while (randomValue[0] >= limit);
  return randomValue[0] % max;
}

function generateTemporaryPassword(length = 48) {
  const alphabet = PASSWORD_CHARSETS.join("");
  const characters = PASSWORD_CHARSETS.map(
    (charset) => charset[secureRandomIndex(charset.length)]
  );

  while (characters.length < length) {
    characters.push(alphabet[secureRandomIndex(alphabet.length)]);
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1);
    [characters[index], characters[swapIndex]] = [
      characters[swapIndex],
      characters[index],
    ];
  }

  return characters.join("");
}

export function useUsers() {
  const { currentUser, userProfile } = useAuth();
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

  const createUser = async ({ email, displayName, role }) => {
    const normalizedEmail = String(email || "").trim();
    const normalizedDisplayName = String(displayName || "").trim();

    if (!currentUser || userProfile?.role !== ROLES.ADMIN || userProfile?.actif === false) {
      return { success: false, error: "La création de comptes est réservée à un administrateur actif." };
    }
    if (!normalizedDisplayName || !normalizedEmail) {
      return { success: false, error: "Le nom et l’adresse e-mail sont obligatoires." };
    }
    if (!Object.values(ROLES).includes(role)) {
      return { success: false, error: "Le rôle sélectionné n’est pas valide." };
    }

    let temporaryPassword = "";
    let secondaryApp;
    let secondaryAuth;
    let authCreationError;
    let createdUid;
    let cleanupFailed = false;

    try {
      temporaryPassword = generateTemporaryPassword();
      secondaryApp = initializeApp(app.options, "creationComptes");
      secondaryAuth = getAuth(secondaryApp);
      const credential = await createUserWithEmailAndPassword(
        secondaryAuth,
        normalizedEmail,
        temporaryPassword
      );
      createdUid = credential.user.uid;
    } catch (err) {
      authCreationError = err?.code || "unknown-error";
    } finally {
      // The password exists only long enough to create the Auth account.
      temporaryPassword = "";
      if (secondaryAuth?.currentUser) {
        try {
          await signOut(secondaryAuth);
        } catch {
          cleanupFailed = true;
        }
      }
      if (secondaryApp) {
        try {
          await deleteApp(secondaryApp);
        } catch {
          cleanupFailed = true;
        }
      }
    }

    if (authCreationError) {
      const safeMessages = {
        "auth/email-already-in-use": "Cette adresse e-mail possède déjà un compte.",
        "auth/invalid-email": "L’adresse e-mail n’est pas valide.",
        "auth/weak-password": "Firebase a refusé le mot de passe temporaire généré. Réessayez.",
        "secure-random-unavailable": "La génération sécurisée du mot de passe est indisponible dans ce navigateur.",
      };
      return {
        success: false,
        error: safeMessages[authCreationError] || "La création du compte d’authentification a échoué.",
      };
    }

    if (cleanupFailed) {
      return {
        success: false,
        reconciliationRequired: Boolean(createdUid),
        error: createdUid
          ? `Le compte Auth a été créé, mais la session secondaire n’a pas pu être fermée proprement. UID à réconcilier : ${createdUid}.`
          : "La session temporaire n’a pas pu être fermée proprement. Aucun profil Firestore n’a été écrit.",
      };
    }

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "users", createdUid), {
        displayName: normalizedDisplayName,
        email: normalizedEmail,
        role,
        actif: true,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });
      batch.set(doc(collection(db, "logs_activite")), {
        uid: currentUser.uid,
        action: "ACCOUNT_CREATED",
        date: serverTimestamp(),
        détail: {
          targetUid: createdUid,
          role,
        },
      });
      await batch.commit();
    } catch {
      return {
        success: false,
        reconciliationRequired: true,
        error: `Le compte Firebase Auth existe, mais l’écriture du profil et du journal n’a pas été confirmée. UID à réconcilier : ${createdUid}. Vérifiez Firestore avant toute nouvelle tentative.`,
      };
    }

    let warning;
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
    } catch {
      warning = "Le compte est créé, mais l’e-mail de réinitialisation n’a pas pu être envoyé. L’utilisateur pourra demander un lien depuis « Mot de passe oublié ».";
    }

    await fetchUsers();
    return { success: true, uid: createdUid, warning };
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
