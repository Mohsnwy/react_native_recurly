import { useAuth, useClerk, useSignUp } from "@clerk/expo";
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

const SignUp = () => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signUp } = useSignUp();
  const { setActive } = useClerk();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
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

  const handleCreateAccount = async () => {
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please add your first and last name.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!signUp) {
      setError("We’re setting up your secure account.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error: createError } = await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress: trimmedEmail,
        password,
      });

      if (createError) {
        setError(createError.message || "Unable to create account.");
        return;
      }

      const { error: sendCodeError } =
        await signUp.verifications.sendEmailCode();

      if (sendCodeError) {
        setError(sendCodeError.message || "Unable to send verification code.");
        return;
      }

      setStep("verify");
    } catch (createError: unknown) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Unable to create account.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    setError("");

    if (verificationCode.trim().length !== 6) {
      setError("Enter the 6-digit verification code sent to your email.");
      return;
    }

    if (!signUp) {
      setError("Your verification is still loading.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error: verifyError } = await signUp.verifications.verifyEmailCode(
        {
          code: verificationCode.trim(),
        },
      );

      if (verifyError) {
        setError(
          verifyError.message || "The code doesn’t match. Please try again.",
        );
        return;
      }

      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setError(
          finalizeError.message || "Unable to finish creating your account.",
        );
        return;
      }

      if (signUp.status === "complete" && signUp.createdSessionId) {
        await setActive?.({ session: signUp.createdSessionId });
        router.replace("/(tabs)");
        return;
      }

      setError("The code doesn’t match. Please try again.");
    } catch (verifyError: unknown) {
      const message =
        verifyError instanceof Error
          ? verifyError.message
          : "Unable to verify code.";
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

          <Text className="auth-title">
            {step === "form" ? "Create account" : "Verify your email"}
          </Text>
          <Text className="auth-subtitle">
            {step === "form"
              ? "Create a secure account to keep every recurring cost in view."
              : "Check your inbox for a 6-digit code to complete your sign-up."}
          </Text>

          <View className="auth-card">
            {step === "form" ? (
              <View className="auth-form">
                <View className="picker-row">
                  <View className="auth-field flex-1">
                    <Text className="auth-label">First name</Text>
                    <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Jane"
                      className="auth-input"
                    />
                  </View>
                  <View className="auth-field flex-1">
                    <Text className="auth-label">Last name</Text>
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Doe"
                      className="auth-input"
                    />
                  </View>
                </View>

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
                      placeholder="At least 8 characters"
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

                <View className="auth-field">
                  <Text className="auth-label">Confirm password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter your password"
                    secureTextEntry={!showPassword}
                    className="auth-input"
                  />
                </View>

                {error ? <Text className="auth-error">{error}</Text> : null}

                <TouchableOpacity
                  onPress={handleCreateAccount}
                  disabled={isSubmitting}
                  className={`auth-button ${isSubmitting ? "auth-button-disabled" : ""}`}
                >
                  <Text className="auth-button-text">
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="123456"
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    className="auth-input"
                  />
                </View>

                {error ? <Text className="auth-error">{error}</Text> : null}

                <TouchableOpacity
                  onPress={handleVerify}
                  disabled={isSubmitting}
                  className={`auth-button ${isSubmitting ? "auth-button-disabled" : ""}`}
                >
                  <Text className="auth-button-text">
                    {isSubmitting ? "Verifying..." : "Verify email"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setError("");
                    setVerificationCode("");
                    setStep("form");
                  }}
                  className="auth-secondary-button"
                >
                  <Text className="auth-secondary-button-text">
                    Use a different email
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account?</Text>
            <Pressable onPress={() => router.push("/(auth)/sign-in")}>
              <Text className="auth-link">Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
