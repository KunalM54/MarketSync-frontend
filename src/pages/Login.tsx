import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/FormField";
import { AlertIcon, CheckCircleIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, PhoneIcon } from "../components/icons";
import { ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { isValidPhone, normalizePhone } from "../lib/phone";

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as
    | { registered?: boolean; reset?: boolean; from?: string }
    | null;
  const justRegistered = navState?.registered ?? false;
  const justReset = navState?.reset ?? false;

  const homeFor = (role: string) => (role === "CUSTOMER" ? "/shop" : "/dashboard");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Sign in — CommerceX";
  }, []);

  // Already signed in? Straight to your home for your role.
  useEffect(() => {
    if (user) navigate(homeFor(user.role), { replace: true });
  }, [user, navigate]);

  const isEmail = /@/.test(identifier.trim());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isEmailValue = /@/.test(identifier.trim());
    const errs: Record<string, string> = {};
    if (!identifier.trim()) errs.identifier = "Enter your phone number.";
    else if (!isEmailValue && !isValidPhone(identifier)) errs.identifier = "Enter a 10-digit mobile number.";
    if (!password) errs.password = "Password is required.";
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError(null);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const payload = isEmailValue ? identifier.trim() : normalizePhone(identifier);
      const data = await signIn(payload, password);
      navigate(navState?.from ?? homeFor(data.role));
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
        <h1>Welcome back</h1>
        <p>Sign in with your phone number.</p>
      </div>

      {justRegistered ? (
        <div className="alert alert-success" role="status">
          <CheckCircleIcon />
          <span>Your account was created. Sign in to continue.</span>
        </div>
      ) : null}

      {justReset ? (
        <div className="alert alert-success" role="status">
          <CheckCircleIcon />
          <span>Password updated. Sign in with your new password.</span>
        </div>
      ) : null}

      {formError ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{formError}</span>
        </div>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="identifier"
          label="Phone number"
          type="text"
          autoComplete="username"
          autoFocus
          placeholder="98765 43210"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={fieldErrors.identifier}
          leadingIcon={isEmail ? <MailIcon /> : <PhoneIcon />}
          prefix={isEmail ? undefined : "+91"}
        />

        <div className="field-stack">
          <TextField
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <div className="field-row-right">
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="auth-switch">
        New to CommerceX?
        <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
