import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

// ============================================================
// Login Screen — simple login form with toggle to register flow
// ============================================================
export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  if (isRegister) {
    return (
      <RegisterFlow
        onBack={() => setIsRegister(false)}
        onComplete={login}
        navigation={navigation}
      />
    );
  }

  return (
    <LoginForm
      onSwitchToRegister={() => setIsRegister(true)}
      onLogin={login}
    />
  );
}

// ============================================================
// Login Form
// ============================================================
function LoginForm({ onSwitchToRegister, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı boş bırakılamaz.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Hata', 'Şifre boş bırakılamaz.');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.login(username.trim(), password);
      if (response && response.success) {
        await onLogin(response.user || response.data);
      } else {
        Alert.alert('Hata', response?.message || 'Giriş başarısız oldu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="book" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.brandTitle}>Dictionary</Text>
          <Text style={styles.brandSubtitle}>Hesabına giriş yap</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı adı"
              placeholderTextColor={Colors.textLight}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor={Colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.submitButtonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleButton} onPress={onSwitchToRegister}>
            <Text style={styles.toggleText}>
              Hesabın yok mu?{' '}
              <Text style={styles.toggleTextBold}>Kayıt Ol</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// Multi-step Register Flow
// Steps: 1) Username  2) Password  3) Biography  4) Success
// ============================================================
const STEPS = {
  USERNAME: 0,
  PASSWORD: 1,
  BIOGRAPHY: 2,
  SUCCESS: 3,
};

function RegisterFlow({ onBack, onComplete, navigation }) {
  const [step, setStep] = useState(STEPS.USERNAME);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [biography, setBiography] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  // Step 1: Check username availability
  const handleUsernameNext = async () => {
    if (!username.trim()) {
      setUsernameError('Kullanıcı adı boş bırakılamaz.');
      return;
    }
    if (username.trim().length < 3) {
      setUsernameError('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setUsernameError('');
    try {
      // Enforce a minimum delay so the user perceives the loading state
      const [response] = await Promise.all([
        ApiService.getUserProfile(username.trim()).catch(() => null),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);

      // If success is true, the user was found (meaning the username is TAKEN)
      if (response && response.success) {
        setUsernameError('Bu kullanıcı adı zaten alınmış.');
      } else {
        // If success is false (or it errors out as 404), the user is NOT found -> available!
        setStep(STEPS.PASSWORD);
      }
    } catch (error) {
      // In case of a hard network error we can just fail or let it pass
      // We will assume it's available or ask them to retry
      setStep(STEPS.PASSWORD);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate passwords
  const handlePasswordNext = () => {
    if (!password) {
      setPasswordError('Şifre boş bırakılamaz.');
      return;
    }
    if (password.length < 4) {
      setPasswordError('Şifre en az 4 karakter olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor.');
      return;
    }
    setPasswordError('');
    setStep(STEPS.BIOGRAPHY);
  };

  // Step 3: Submit registration (don't login yet — show success first)
  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await ApiService.register(
        username.trim(),
        password,
        biography.trim()
      );
      if (response && response.success) {
        setRegisteredUser(response.user || response.data);
        setStep(STEPS.SUCCESS);
      } else {
        Alert.alert('Hata', response?.message || 'Kayıt başarısız oldu.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Login and navigate to profile
  const goToProfile = async () => {
    if (registeredUser) {
      await onComplete(registeredUser);
    }
  };

  // Progress indicator
  const totalSteps = 3;
  const currentProgress = step >= STEPS.SUCCESS ? totalSteps : step + 1;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button + Progress (hide on success) */}
        {step !== STEPS.SUCCESS && (
          <View style={styles.registerHeader}>
            <TouchableOpacity
              onPress={step === STEPS.USERNAME ? onBack : () => setStep(step - 1)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.stepIndicator}>
              {currentProgress} / {totalSteps}
            </Text>
          </View>
        )}

        {/* Progress Bar (hide on success) */}
        {step !== STEPS.SUCCESS && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(currentProgress / totalSteps) * 100}%` },
              ]}
            />
          </View>
        )}

        {/* Step Content */}
        {step === STEPS.USERNAME && (
          <View style={styles.stepContent}>
            <View style={styles.stepIconContainer}>
              <Ionicons name="person-add" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Kullanıcı Adı</Text>
            <Text style={styles.stepDescription}>
              Seni tanıyabilmemiz için bir kullanıcı adı seç
            </Text>

            <View style={[styles.inputContainer, usernameError && styles.inputError]}>
              <Ionicons name="at-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Kullanıcı adınız"
                placeholderTextColor={Colors.textLight}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setUsernameError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>
            {usernameError ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={Colors.error} />
                <Text style={styles.errorText}>{usernameError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleUsernameNext}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textOnPrimary} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>İlerle</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.textOnPrimary} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === STEPS.PASSWORD && (
          <View style={styles.stepContent}>
            <View style={styles.stepIconContainer}>
              <Ionicons name="shield-checkmark" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Şifre Oluştur</Text>
            <Text style={styles.stepDescription}>
              Hesabını korumak için güçlü bir şifre belirle
            </Text>

            <View style={[styles.inputContainer, passwordError && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Şifre"
                placeholderTextColor={Colors.textLight}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, passwordError && styles.inputError]}>
              <Ionicons name="lock-open-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Şifre tekrar"
                placeholderTextColor={Colors.textLight}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setPasswordError('');
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {passwordError ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={14} color={Colors.error} />
                <Text style={styles.errorText}>{passwordError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handlePasswordNext}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>İlerle</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.textOnPrimary} />
            </TouchableOpacity>
          </View>
        )}

        {step === STEPS.BIOGRAPHY && (
          <View style={styles.stepContent}>
            <View style={styles.stepIconContainer}>
              <Ionicons name="document-text" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Biyografi</Text>
            <Text style={styles.stepDescription}>
              Kendinden biraz bahset (opsiyonel)
            </Text>

            <View style={[styles.inputContainer, styles.bioContainer]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Biyografinizi yazın..."
                placeholderTextColor={Colors.textLight}
                value={biography}
                onChangeText={setBiography}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textOnPrimary} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.textOnPrimary} />
                  <Text style={styles.submitButtonText}>Kayıt Ol</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => {
                setBiography('');
                handleRegister();
              }}
            >
              <Text style={styles.skipText}>Atla</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === STEPS.SUCCESS && (
          <View style={styles.successContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Kayıt Tamamlandı! 🎉</Text>
            <Text style={styles.successDescription}>
              Hoş geldin <Text style={styles.accentText}>@{username}</Text>!{'\n'}
              Hesabın başarıyla oluşturuldu.
            </Text>

            <TouchableOpacity
              style={[styles.submitButton, styles.successButton]}
              onPress={goToProfile}
              activeOpacity={0.8}
            >
              <Ionicons name="person" size={18} color={Colors.textOnPrimary} />
              <Text style={styles.submitButtonText}>Profile Git</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// Styles
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },

  // Brand (Login)
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Form
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  inputError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  toggleButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  toggleTextBold: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Register Header
  registerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepIndicator: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  // Progress Bar
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  // Step Content
  stepContent: {
    alignItems: 'stretch',
  },
  stepIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  stepTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
  },

  // Biography
  bioContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  bioInput: {
    height: '100%',
  },
  skipButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  skipText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Success
  successContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successDescription: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  successButton: {
    paddingHorizontal: Spacing.xxl,
  },
  accentText: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
