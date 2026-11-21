import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  getDoc,
  doc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { AuthProvider, useAuth } from "./AuthContext";
import { auth, db } from "../firebase";

let mockAuthStateCallback;

jest.mock("firebase/auth", () => ({
  EmailAuthProvider: { credential: jest.fn() },
  onAuthStateChanged: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updatePassword: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn((...args) => args),
  getDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock("../firebase", () => ({
  auth: {},
  db: {},
}));

function AuthStateProbe() {
  const { authError, currentUser, loading, login, userProfile } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{currentUser?.uid || "none"}</span>
      <span data-testid="profile">{userProfile?.role || "none"}</span>
      <span data-testid="auth-error">{authError || "none"}</span>
      <button
        type="button"
        onClick={() => login("admin@example.test", "temporary-test-value").catch(() => {})}
      >
        Sign in
      </button>
    </div>
  );
}

function renderAuthProbe() {
  return render(
    <AuthProvider>
      <AuthStateProbe />
    </AuthProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthStateCallback = null;
  onAuthStateChanged.mockImplementation((_, callback) => {
    mockAuthStateCallback = callback;
    return jest.fn();
  });
  signOut.mockResolvedValue();
});

test("auth-state profile denial clears the profile and always exits loading", async () => {
  getDoc.mockRejectedValueOnce(Object.assign(new Error("denied"), {
    code: "permission-denied",
  }));
  renderAuthProbe();

  await act(async () => {
    await mockAuthStateCallback({ uid: "admin-uid" });
  });

  expect(doc).toHaveBeenCalledWith(db, "users", "admin-uid");
  expect(screen.getByTestId("loading")).toHaveTextContent("false");
  expect(screen.getByTestId("user")).toHaveTextContent("none");
  expect(screen.getByTestId("profile")).toHaveTextContent("none");
  expect(screen.getByTestId("auth-error")).toHaveTextContent(
    "profile/permission-denied"
  );
  expect(signOut).toHaveBeenCalledWith(auth);
});

test("login profile denial is exposed as a specific auth error", async () => {
  signInWithEmailAndPassword.mockResolvedValue({
    user: { uid: "admin-uid" },
  });
  getDoc.mockRejectedValueOnce(Object.assign(new Error("denied"), {
    code: "permission-denied",
  }));
  renderAuthProbe();

  await act(async () => {
    await mockAuthStateCallback(null);
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

  await waitFor(() => {
    expect(screen.getByTestId("auth-error")).toHaveTextContent(
      "profile/permission-denied"
    );
  });
  expect(screen.getByTestId("profile")).toHaveTextContent("none");
  expect(signOut).toHaveBeenCalledWith(auth);
});
