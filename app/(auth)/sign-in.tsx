import { useAuth, useClerk, useSignIn } from "@clerk/expo";
import { Redirect, router } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = () => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  const { setActive } = useClerk();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!authLoaded) {
    return (
      <SafeAreaView className="auth-safe-area">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea7a53" />
        </View>
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!password.trim() || password.trim().length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!signIn) {
      setError("We’re preparing your secure sign-in session.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error: createError } = await signIn.create({
        identifier: trimmedEmail,
        password,
      });

      if (createError) {
        setError(createError.message || "Unable to sign in.");
        return;
      }

      if (signIn.status === "complete" && signIn.createdSessionId) {
        await setActive?.({ session: signIn.createdSessionId });
        router.replace("/(tabs)");
        return;
      }

      setError("This account needs an extra security step before continuing.");
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="auth-screen"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="auth-content"
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">S</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurly</Text>
                <Text className="auth-wordmark-sub">Track every renewal</Text>
              </View>
            </View>
          </View>

          <Text className="auth-title">Welcome back</Text>
          <Text className="auth-subtitle">
            Sign in to manage renewals, review your subscriptions, and keep your
            spending on track.
          </Text>

          <View className="auth-card">
            <View className="auth-form">
              <View className="auth-field">
                <Text className="auth-label">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="auth-input"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Password</Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    className="auth-input pr-12"
                  />
                  <Pressable
                    onPress={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-4"
                  >
                    <Text className="text-sm font-sans-semibold text-accent">
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {error ? <Text className="auth-error">{error}</Text> : null}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className={`auth-button ${isSubmitting ? "auth-button-disabled" : ""}`}
              >
                <Text className="auth-button-text">
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Text>
              </TouchableOpacity>

              <View className="auth-divider-row">
                <View className="auth-divider-line" />
                <Text className="auth-divider-text">or</Text>
                <View className="auth-divider-line" />
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(auth)/sign-up")}
                className="auth-secondary-button"
              >
                <Text className="auth-secondary-button-text">
                  Create an account
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">New to Recurly?</Text>
            <Pressable onPress={() => router.push("/(auth)/sign-up")}>
              <Text className="auth-link">Create an account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
