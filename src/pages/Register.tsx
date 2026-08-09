import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/FormField";
import { AlertIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, PhoneIcon, UserIcon } from "../components/icons";
import { ApiError } from "../lib/api";
import { registerUser, useAuth } from "../lib/auth";
import { digitsOnly, isValidPhone, normalizePhone } from "../lib/phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterForm {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: RegisterForm = { name: "", phone: "", email: "", password: "", confirmPassword: "" };

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

  // Already signed in? Straight to your home for your role.
  useEffect(() => {
    if (user) navigate(user.role === "CUSTOMER" ? "/shop" : "/dashboard", { replace: true });
  }, [user, navigate]);

  const setPhone = (value: string) => setForm((f) => ({ ...f, phone: digitsOnly(value) }));
  const set = (key: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    const phone = form.phone;
    const email = form.email.trim();

    if (name.length < 3) errs.name = "Name must be at least 3 characters.";
    else if (name.length > 50) errs.name = "Name cannot exceed 50 characters.";

    if (!phone) errs.phone = "Phone number is required.";
    else if (!isValidPhone(phone)) errs.phone = "Enter a 10-digit mobile number.";

    if (email && !EMAIL_RE.test(email)) errs.email = "Please enter a valid email address.";

    if (form.password.length < 4) errs.password = "Password must be at least 4 characters.";
    else if (form.password.length > 10) errs.password = "Password cannot exceed 10 characters.";

    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match.";

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
        phone: normalizePhone(form.phone),
        password: form.password,
        ...(form.email.trim() && { email: form.email.trim() }),
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
          id="phone"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          placeholder="98765 43210"
          value={form.phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldErrors.phone}
          leadingIcon={<PhoneIcon />}
          prefix="+91"
          hint="Required — sign in with this"
        />

        <TextField
          id="email"
          label="Email"
          hint="Optional"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
          error={fieldErrors.email}
          leadingIcon={<MailIcon />}
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
