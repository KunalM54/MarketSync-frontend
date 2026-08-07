import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/FormField";
import { AlertIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, PhoneIcon, UserIcon } from "../components/icons";
import { ApiError } from "../lib/api";
import { registerUser, useAuth } from "../lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+[1-9]\d{1,14}$/;

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: RegisterForm = { name: "", email: "", phone: "", password: "", confirmPassword: "" };

export default function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Create account — CommerceX";
  }, []);

  // Already signed in? Straight to the dashboard.
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const set = (key: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (name.length < 3) errs.name = "Name must be at least 3 characters.";
    else if (name.length > 50) errs.name = "Name cannot exceed 50 characters.";

    if (!EMAIL_RE.test(email)) errs.email = "Please enter a valid email address.";

    if (form.password.length < 4) errs.password = "Password must be at least 4 characters.";
    else if (form.password.length > 10) errs.password = "Password cannot exceed 10 characters.";

    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match.";

    if (phone && !PHONE_RE.test(phone)) errs.phone = "Use E.164 format, e.g. +919876543210.";

    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError(null);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-head">
        <h1>Create your account</h1>
        <p>Free forever. Set up takes minutes, not months.</p>
      </div>

      {formError ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{formError}</span>
        </div>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          autoFocus
          placeholder="Ada Lovelace"
          value={form.name}
          onChange={set("name")}
          error={fieldErrors.name}
          leadingIcon={<UserIcon />}
        />

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
          error={fieldErrors.email}
          leadingIcon={<MailIcon />}
        />

        <TextField
          id="phone"
          label="Phone"
          hint="Optional"
          type="tel"
          autoComplete="tel"
          placeholder="+919876543210"
          value={form.phone}
          onChange={set("phone")}
          error={fieldErrors.phone}
          leadingIcon={<PhoneIcon />}
        />

        <TextField
          id="password"
          label="Password"
          hint="4–10 characters"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={set("password")}
          error={fieldErrors.password}
          leadingIcon={<LockIcon />}
          trailing={
            <button
              type="button"
              className="pass-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />

        <TextField
          id="confirmPassword"
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={fieldErrors.confirmPassword}
          leadingIcon={<LockIcon />}
          trailing={
            <button
              type="button"
              className="pass-toggle"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              title={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="auth-terms">
        By creating an account, you agree to CommerceX&apos;s terms and privacy policy.
      </p>

      <p className="auth-switch">
        Already have an account?
        <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
