import { useAuth, useUser } from "@clerk/expo";
import { router } from "expo-router";
import { styled } from "nativewind";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { isLoaded: authLoaded, isSignedIn, signOut } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  if (!authLoaded || !userLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ea7a53" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg font-sans-semibold text-primary">
            Please sign in to view your profile.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const fullName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "Recurly user";
  const emailAddress = user.emailAddresses[0]?.emailAddress || "No email found";
  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.trim() || "R";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="mb-6 text-3xl font-sans-bold text-primary">Profile</Text>

      <View className="rounded-3xl border border-border bg-card p-5">
        <View className="flex-row items-center gap-4">
          {user.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Text className="text-xl font-sans-bold text-primary">
                {initials}
              </Text>
            </View>
          )}

          <View className="flex-1">
            <Text className="text-2xl font-sans-bold text-primary">
              {fullName}
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              {emailAddress}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-6 rounded-3xl border border-border bg-card p-4">
        <Text className="text-base font-sans-semibold text-muted-foreground">
          Account details
        </Text>
        <Text className="mt-3 text-lg font-sans-bold text-primary">
          {emailAddress}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleSignOut}
        className="mt-8 items-center rounded-2xl bg-primary py-4"
      >
        <Text className="text-base font-sans-bold text-background">
          Sign out
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Settings;
