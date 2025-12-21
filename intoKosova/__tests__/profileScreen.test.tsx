import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ProfileScreen from "@/app/(tabs)/profile_new";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

// ================= MOCKS =================

// Disable animations
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

// Firebase Auth
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// ✅ FIXED Firebase config path (using alias)
jest.mock("@/firebase", () => ({
  auth: {},
}));

describe("ProfileScreen (Register-like tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- helpers ----------
  const mockLoggedOut = () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, cb) => {
      cb(null);
      return jest.fn();
    });
  };

  const mockLoggedIn = () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, cb) => {
      cb({
        email: "user@test.com",
        displayName: "Test User",
      });
      return jest.fn();
    });
  };

  // ================= LOGGED OUT =================

  it("renders login form when user is not authenticated", async () => {
    mockLoggedOut();

    const { findByText, findByPlaceholderText } = render(<ProfileScreen />);

    // wait for auth resolution
    await waitFor(() => expect(onAuthStateChanged).toHaveBeenCalled());

    expect(await findByText("Welcome back")).toBeTruthy();
    expect(await findByPlaceholderText("Email")).toBeTruthy();
    expect(await findByPlaceholderText("Password")).toBeTruthy();
    expect(await findByText("Log In")).toBeTruthy();
  });

  it("updates email and password inputs when user types", async () => {
    mockLoggedOut();

    const { findByPlaceholderText } = render(<ProfileScreen />);

    await waitFor(() => expect(onAuthStateChanged).toHaveBeenCalled());

    const emailInput = await findByPlaceholderText("Email");
    const passwordInput = await findByPlaceholderText("Password");

    fireEvent.changeText(emailInput, "test@email.com");
    fireEvent.changeText(passwordInput, "123456");

    expect(emailInput.props.value).toBe("test@email.com");
    expect(passwordInput.props.value).toBe("123456");
  });

  it("shows error when submitting empty form", async () => {
    mockLoggedOut();

    const { findByText } = render(<ProfileScreen />);

    await waitFor(() => expect(onAuthStateChanged).toHaveBeenCalled());

    fireEvent.press(await findByText("Log In"));

    expect(await findByText("Please fill all required fields.")).toBeTruthy();
  });

  it("switches to Sign Up mode when link is pressed", async () => {
    mockLoggedOut();

    const { findByText, findByPlaceholderText } = render(<ProfileScreen />);

    await waitFor(() => expect(onAuthStateChanged).toHaveBeenCalled());

    fireEvent.press(await findByText("No account? Sign Up"));

    expect(await findByText("Create your account")).toBeTruthy();
    expect(await findByPlaceholderText("Full name")).toBeTruthy();
    expect(await findByText("Sign Up")).toBeTruthy();
  });

  // ================= AUTH SUCCESS =================

  it("calls signInWithEmailAndPassword on successful login", async () => {
    mockLoggedOut();

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: {
        email: "test@email.com",
        displayName: "Test User",
      },
    });

    const { findByPlaceholderText, findByText } = render(<ProfileScreen />);

    await waitFor(() => expect(onAuthStateChanged).toHaveBeenCalled());

    fireEvent.changeText(
      await findByPlaceholderText("Email"),
      "test@email.com"
    );
    fireEvent.changeText(await findByPlaceholderText("Password"), "123456");

    fireEvent.press(await findByText("Log In"));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
    });
  });

  // ================= LOGGED IN =================

  it("renders profile screen when user is authenticated", async () => {
    mockLoggedIn();

    const { findByText } = render(<ProfileScreen />);

    await waitFor(() => expect(onAuthStateChanged).toHaveBeenCalled());

    expect(await findByText("Test User")).toBeTruthy();
    expect(await findByText("user@test.com")).toBeTruthy();
    expect(await findByText("My Favorites")).toBeTruthy();
  });
});
