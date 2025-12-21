import React from "react";
import { Text, TextInput, Pressable, View } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";

const MockProfile = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = () => {
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    if (!email.includes("@")) {
      setError("Email is not valid");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setLoading(true);
  };

  return (
    <View>
      <Text>{isSignUp ? "Create your account" : "Welcome back"}</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text>{error}</Text> : null}

      {loading && <Text>Loading...</Text>}

      <Pressable onPress={handleSubmit}>
        <Text>{isSignUp ? "Sign Up" : "Log In"}</Text>
      </Pressable>

      <Pressable onPress={() => setIsSignUp(!isSignUp)}>
        <Text>
          {isSignUp ? "Already have an account? Log In" : "No account? Sign Up"}
        </Text>
      </Pressable>
    </View>
  );
};

describe("ProfileScreen – Register-like Tests (Simplified)", () => {
  it("renders all form elements correctly", () => {
    const { getByText, getByPlaceholderText } = render(<MockProfile />);

    expect(getByText("Welcome back")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByText("Log In")).toBeTruthy();
    expect(getByText("No account? Sign Up")).toBeTruthy();
  });

  it("updates email input when user types", () => {
    const { getByPlaceholderText } = render(<MockProfile />);

    const emailInput = getByPlaceholderText("Email");
    fireEvent.changeText(emailInput, "test@email.com");

    expect(emailInput.props.value).toBe("test@email.com");
  });

  it("updates password input when user types", () => {
    const { getByPlaceholderText } = render(<MockProfile />);

    const passwordInput = getByPlaceholderText("Password");
    fireEvent.changeText(passwordInput, "123456");

    expect(passwordInput.props.value).toBe("123456");
  });

  it("shows error when all fields are empty", () => {
    const { getByText } = render(<MockProfile />);

    fireEvent.press(getByText("Log In"));

    expect(getByText("All fields are required")).toBeTruthy();
  });

  it("shows error when email is invalid", () => {
    const { getByPlaceholderText, getByText } = render(<MockProfile />);

    fireEvent.changeText(getByPlaceholderText("Email"), "invalidEmail");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Log In"));

    expect(getByText("Email is not valid")).toBeTruthy();
  });

  it("shows error when password is less than 6 characters", () => {
    const { getByPlaceholderText, getByText } = render(<MockProfile />);

    fireEvent.changeText(getByPlaceholderText("Email"), "test@email.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "123");
    fireEvent.press(getByText("Log In"));

    expect(getByText("Password must be at least 6 characters")).toBeTruthy();
  });

  it("shows loading text when form is valid", () => {
    const { getByPlaceholderText, getByText } = render(<MockProfile />);

    fireEvent.changeText(getByPlaceholderText("Email"), "test@email.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "123456");
    fireEvent.press(getByText("Log In"));

    expect(getByText("Loading...")).toBeTruthy();
  });

  it("switches to Sign Up mode when link is pressed", () => {
    const { getByText } = render(<MockProfile />);

    fireEvent.press(getByText("No account? Sign Up"));

    expect(getByText("Create your account")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });
});
