import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../lib/auth";
import { apiRequest, ApiError } from "../../lib/api";
import TextField from "../../components/FormField";
import {
  AlertIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from "../../components/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+[1-9]\d{1,14}$/;
const OTP_RE = /^\d{6}$/;

export default function AccountSettings() {
  const { user, refresh } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
  }, [user]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Name must be at least 2 characters.";
    if (email.trim() && !EMAIL_RE.test(email.trim())) errs.email = "Please enter a valid email address.";
    if (phone.trim() && !PHONE_RE.test(phone.trim()))
      errs.phone = "Use E.164 format, e.g. +919876543210.";

    if (Object.keys(errs).length > 0) {
      setProfileSuccess(null);
      setProfileError("Please fix the highlighted fields.");
      return;
    }

    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      await apiRequest("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        }),
      });
      await refresh();
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(
        err instanceof ApiError ? err.message : "Could not update your profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const sendOtp = async () => {
    if (sendingOtp) return;
    setSendingOtp(true);
    setOtpError(null);
    setOtpSuccess(null);
    setDevOtp(null);
    try {
      const data = await apiRequest<{ devOtp?: string } | null>("/auth/send-phone-otp", {
        method: "POST",
        body: "{}",
      });
      setOtpSent(true);
      if (data?.devOtp) setDevOtp(data.devOtp);
    } catch (err) {
      setOtpError(
        err instanceof ApiError ? err.message : "Could not send the OTP.",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();

    if (!OTP_RE.test(otp)) {
      setOtpError("OTP must be exactly 6 digits.");
      return;
    }

    setVerifyingOtp(true);
    setOtpError(null);
    setOtpSuccess(null);
    try {
      await apiRequest("/auth/verify-phone-otp", {
        method: "POST",
        body: JSON.stringify({ otp }),
      });
      await refresh();
      setOtpSent(false);
      setOtp("");
      setOtpSuccess("Phone number verified successfully.");
    } catch (err) {
      setOtpError(
        err instanceof ApiError ? err.message : "Could not verify the OTP.",
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = "Current password is required.";
    if (newPassword.length < 4) errs.newPassword = "Password must be at least 4 characters.";
    else if (newPassword.length > 10) errs.newPassword = "Password cannot exceed 10 characters.";
    if (confirmPassword !== newPassword) errs.confirmPassword = "Passwords do not match.";

    if (Object.keys(errs).length > 0) {
      setPwSuccess(null);
      setPwError("Please fix the highlighted fields.");
      return;
    }

    setSavingPassword(true);
    setPwError(null);
    setPwSuccess(null);
    try {
      await apiRequest("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwSuccess("Password changed successfully.");
    } catch (err) {
      setPwError(
        err instanceof ApiError ? err.message : "Could not change your password.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const phoneVerified = user?.isPhoneVerified ?? false;

  return (
    <div className="dash-module">
      <div className="page-head">
        <div>
          <h1>Account settings</h1>
          <p className="page-sub">
            Manage your profile, phone verification, and password.
          </p>
        </div>
      </div>

      {/* Profile */}
      <section className="settings-panel">
        <div className="settings-panel-head">
          <span className="settings-panel-ico">
            <UserIcon />
          </span>
          <div>
            <h2>Profile details</h2>
            <p>Your name, email, and phone number across CommerceX.</p>
          </div>
        </div>

        {profileError ? (
          <div className="alert alert-error" role="alert">
            <AlertIcon />
            <span>{profileError}</span>
          </div>
        ) : null}
        {profileSuccess ? (
          <div className="alert alert-success" role="status">
            <AlertIcon />
            <span>{profileSuccess}</span>
          </div>
        ) : null}

        <form className="settings-form" onSubmit={saveProfile} noValidate>
          <TextField
            id="acc-name"
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leadingIcon={<UserIcon />}
          />
          <TextField
            id="acc-email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leadingIcon={<MailIcon />}
          />
          <TextField
            id="acc-phone"
            label="Phone"
            hint="E.164 format, e.g. +919876543210"
            type="tel"
            autoComplete="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leadingIcon={<PhoneIcon />}
          />
          <div className="settings-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
            >
              {savingProfile ? <span className="spinner" aria-hidden="true" /> : null}
              Save changes
            </button>
          </div>
        </form>
      </section>

      {/* Phone verification */}
      <section className="settings-panel">
        <div className="settings-panel-head">
          <span className="settings-panel-ico">
            <PhoneIcon />
          </span>
          <div>
            <h2>Phone verification</h2>
            <p>Confirm your phone number to secure your account.</p>
          </div>
        </div>

        {otpError ? (
          <div className="alert alert-error" role="alert">
            <AlertIcon />
            <span>{otpError}</span>
          </div>
        ) : null}
        {otpSuccess ? (
          <div className="alert alert-success" role="status">
            <AlertIcon />
            <span>{otpSuccess}</span>
          </div>
        ) : devOtp ? (
          <div className="alert alert-info" role="status">
            <AlertIcon />
            <div>
              <strong>Demo mode</strong> — no SMS provider is connected, so
              your code is:
              <code className="alert-code">{devOtp}</code>
            </div>
          </div>
        ) : null}

        {phoneVerified ? (
          <div className="verified-row">
            <CheckCircleIcon />
            <strong>Verified</strong>
          </div>
        ) : !user?.phone ? (
          <p className="muted">
            You haven&apos;t added a phone number yet. Save your number in the
            profile section above, then come back here to verify it.
          </p>
        ) : otpSent ? (
          <form className="otp-row" onSubmit={verifyOtp} noValidate>
            <TextField
              id="acc-otp"
              label="Enter the 6-digit OTP"
              hint="Check the backend console for the code (demo)"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, ""))}
              leadingIcon={<PhoneIcon />}
            />
            <div className="settings-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void sendOtp()}
                disabled={sendingOtp}
              >
                {sendingOtp ? "Resending…" : "Resend OTP"}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={verifyingOtp}
              >
                {verifyingOtp ? <span className="spinner" aria-hidden="true" /> : null}
                Verify phone
              </button>
            </div>
          </form>
        ) : (
          <div className="settings-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void sendOtp()}
              disabled={sendingOtp}
            >
              {sendingOtp ? <span className="spinner" aria-hidden="true" /> : null}
              Verify {user.phone}
            </button>
          </div>
        )}
      </section>

      {/* Password */}
      <section className="settings-panel">
        <div className="settings-panel-head">
          <span className="settings-panel-ico">
            <LockIcon />
          </span>
          <div>
            <h2>Change password</h2>
            <p>Use at least 4 characters (max 10).</p>
          </div>
        </div>

        {pwError ? (
          <div className="alert alert-error" role="alert">
            <AlertIcon />
            <span>{pwError}</span>
          </div>
        ) : null}
        {pwSuccess ? (
          <div className="alert alert-success" role="status">
            <AlertIcon />
            <span>{pwSuccess}</span>
          </div>
        ) : null}

        <form className="settings-form" onSubmit={changePassword} noValidate>
          <TextField
            id="acc-current"
            label="Current password"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            leadingIcon={<LockIcon />}
            trailing={
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? "Hide password" : "Show password"}
                title={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
          <TextField
            id="acc-new"
            label="New password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leadingIcon={<LockIcon />}
            trailing={
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? "Hide password" : "Show password"}
                title={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
          <TextField
            id="acc-confirm"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leadingIcon={<LockIcon />}
          />
          <div className="settings-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingPassword}
            >
              {savingPassword ? <span className="spinner" aria-hidden="true" /> : null}
              Update password
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}