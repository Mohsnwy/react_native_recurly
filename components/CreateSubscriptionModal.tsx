import { icons } from "@/constants/icons";
import clsx from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const categories = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const categoryColors: Record<(typeof categories)[number], string> = {
  Entertainment: "#e8def8",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#d8e7ff",
  Design: "#f5c542",
  Productivity: "#c9e4de",
  Cloud: "#b8e8d0",
  Music: "#f7c6c7",
  Other: "#f6eecf",
};

type Frequency = "Monthly" | "Yearly";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
}

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("Entertainment");
  const [error, setError] = useState("");

  const numericPrice = Number(price.replace(",", "."));
  const isFormValid = Boolean(name.trim()) && Number.isFinite(numericPrice) && numericPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Enter a subscription name.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a price greater than zero.");
      return;
    }

    const startDate = dayjs();
    const renewalDate = startDate.add(
      1,
      frequency === "Monthly" ? "month" : "year",
    );

    onCreate({
      id: `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: trimmedName,
      price: numericPrice,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
      billing: frequency,
      color: categoryColors[category],
      currency: "USD",
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="modal-overlay"
      >
        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close new subscription form"
              onPress={handleClose}
              className="modal-close"
            >
              <Text className="modal-close-text">×</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerClassName="modal-body"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-field">
              <Text className="auth-label">Name</Text>
              <TextInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setError("");
                }}
                placeholder="e.g. Netflix"
                className="auth-input"
              />
            </View>

            <View className="auth-field">
              <Text className="auth-label">Price</Text>
              <TextInput
                value={price}
                onChangeText={(value) => {
                  setPrice(value);
                  setError("");
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="auth-input"
              />
            </View>

            <View className="auth-field">
              <Text className="auth-label">Frequency</Text>
              <View className="picker-row">
                {(["Monthly", "Yearly"] as Frequency[]).map((option) => {
                  const isActive = frequency === option;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      onPress={() => setFrequency(option)}
                      className={clsx(
                        "picker-option",
                        isActive && "picker-option-active",
                      )}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          isActive && "picker-option-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="auth-field">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {categories.map((option) => {
                  const isActive = category === option;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      onPress={() => setCategory(option)}
                      className={clsx(
                        "category-chip",
                        isActive && "category-chip-active",
                      )}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          isActive && "category-chip-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {error ? <Text className="auth-error">{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={!isFormValid}
              onPress={handleSubmit}
              className={clsx(
                "auth-button",
                !isFormValid && "auth-button-disabled",
              )}
            >
              <Text className="auth-button-text">Create subscription</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
