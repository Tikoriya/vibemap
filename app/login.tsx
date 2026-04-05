import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { authApi } from "@/lib/supabase/auth";

type AuthStep = "default" | "email" | "sent";

export default function AuthScreen() {
  const [step, setStep] = useState<AuthStep>("default");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      await authApi.signInWithApple();
      router.replace("/(tabs)/cities");
    } catch (error) {
      const err = error as { code?: string };
      if (err?.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Sign in failed", "Could not sign in with Apple. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    try {
      setIsLoading(true);
      await authApi.signInWithMagicLink(trimmedEmail);
      setStep("sent");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not send the magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;
    try {
      setIsLoading(true);
      await authApi.signInWithPassword(trimmedEmail, password);
      router.replace("/(tabs)/cities");
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Sign in failed",
        "Invalid email or password. If you don't have an account yet, use Create Account.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;
    try {
      setIsLoading(true);
      await authApi.signUpWithPassword(trimmedEmail, password);
      Alert.alert(
        "Account created",
        "Check your email to confirm your account, then sign in.",
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("default");
    setEmail("");
    setPassword("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.logoSection}>
        <Text style={styles.logoText}>VibeMap</Text>
        <Text style={styles.tagline}>
          Your personal map of places worth remembering.
        </Text>
      </View>

      {step === "default" && (
        <View style={styles.authSection}>
          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          <TouchableOpacity
            style={styles.googleButton}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.emailButton}
            onPress={() => setStep("email")}
            activeOpacity={0.8}
          >
            <Text style={styles.emailButtonText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "email" && (
        <View style={styles.authSection}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#8C8078"
            autoCapitalize="none"
            keyboardType="email-address"
            autoFocus
            returnKeyType="next"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password (optional — for magic link leave blank)"
            placeholderTextColor="#8C8078"
            secureTextEntry
            returnKeyType="done"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleSendMagicLink}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Sending…" : "Send magic link"}
            </Text>
          </TouchableOpacity>

          {password.length > 0 && (
            <>
              <TouchableOpacity
                style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleSignInWithPassword}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Sign in with password</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleCreateAccount}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Create account</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.backButton} onPress={handleReset}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "sent" && (
        <View style={styles.authSection}>
          <View style={styles.sentIconContainer}>
            <Text style={styles.sentIcon}>📬</Text>
          </View>
          <Text style={styles.sentTitle}>Check your inbox</Text>
          <Text style={styles.sentBody}>
            We sent a magic link to{"\n"}
            <Text style={styles.sentEmail}>{email}</Text>
            {"\n\n"}Tap the link in your email to sign in — it expires in 1 hour.
          </Text>

          <TouchableOpacity style={styles.backButton} onPress={handleReset}>
            <Text style={styles.backText}>Try a different method</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4F0",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 56,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1A1714",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: "#8C8078",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 260,
  },
  authSection: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  appleButton: {
    width: "100%",
    height: 52,
  },
  googleButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E0D8",
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1714",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 4,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E0D8",
  },
  dividerText: {
    fontSize: 13,
    color: "#8C8078",
  },
  emailButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  emailButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8C8078",
  },
  input: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E0D8",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1A1714",
  },
  primaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#C4703A",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E0D8",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1714",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    color: "#8C8078",
  },
  sentIconContainer: {
    width: 72,
    height: 72,
    backgroundColor: "#F0E0D4",
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  sentIcon: {
    fontSize: 32,
  },
  sentTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1714",
    marginBottom: 12,
  },
  sentBody: {
    fontSize: 15,
    color: "#8C8078",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  sentEmail: {
    color: "#1A1714",
    fontWeight: "600",
  },
});
