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
import { Palette } from "@/constants/Colors";
import { FontFamily } from "@/constants/Typography";

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

  const handleDevLogin = async () => {
    try {
      setIsLoading(true);
      await authApi.signInWithPassword("vlazzarova@yahoo.bg", "Viki1234");
      router.replace("/(tabs)/cities");
    } catch (error) {
      console.error(error);
      Alert.alert("Dev login failed", "Check credentials or Supabase connection.");
    } finally {
      setIsLoading(false);
    }
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
            placeholderTextColor={Palette.subtleText}
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
            placeholderTextColor={Palette.subtleText}
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

      {__DEV__ && (
        <TouchableOpacity
          style={[styles.devButton, isLoading && styles.buttonDisabled]}
          onPress={handleDevLogin}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.devButtonText}>DEV  —  Quick login</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.paper100,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 56,
  },
  logoText: {
    fontFamily: FontFamily.serifBold,
    fontSize: 44,
    color: Palette.forest800,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: FontFamily.serifMediumItalic,
    fontSize: 16,
    color: Palette.subtleText,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
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
    backgroundColor: Palette.paper0,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: Palette.forest800,
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
    backgroundColor: Palette.paper300,
  },
  dividerText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 1.2,
    color: Palette.muted,
  },
  emailButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  emailButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    color: Palette.subtleText,
  },
  input: {
    width: "100%",
    height: 52,
    backgroundColor: Palette.paper0,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.cardBorder,
    paddingHorizontal: 16,
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Palette.forest800,
  },
  primaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: Palette.forest800,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: Palette.paper0,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: Palette.forest800,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: Palette.paper100,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Palette.subtleText,
  },
  sentIconContainer: {
    width: 72,
    height: 72,
    backgroundColor: Palette.ochre50,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  sentIcon: {
    fontSize: 32,
  },
  sentTitle: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 24,
    color: Palette.forest800,
    marginBottom: 12,
  },
  sentBody: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Palette.subtleText,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  sentEmail: {
    fontFamily: FontFamily.semiBold,
    color: Palette.forest800,
  },
  devButton: {
    position: "absolute",
    bottom: 48,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Palette.ochre500,
  },
  devButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    color: Palette.ochre500,
    letterSpacing: 0.5,
  },
});
