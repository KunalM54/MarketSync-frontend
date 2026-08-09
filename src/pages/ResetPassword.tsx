import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/FormField";
import {
  AlertIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  PhoneIcon,
} from "../components/icons";
import { apiRequest, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";

interface ResetState {
  phone?: string;
  token?: string;
}

export default function ResetPasswordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as ResetState;
  const { phone, token } = state;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Reset password — CommerceX";
  }, []);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!password) errs.password = "Enter a new password.";
    if (!confirmPassword) errs.confirmPassword = "Repeat the new password.";
    if (password && confirmPassword && password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError(null);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      await apiRequest<null>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          identifier: phone,
          token,
          password,
          confirmPassword,
        }),
      });
      navigate("/login", { state: { reset: true } });
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

  if (!phone || !token) {
    return (
      <AuthLayout>
        <div className="auth-head">
          <h1>Set a new password</h1>
          <p>You need to verify your phone number first.</p>
        </div>
        <div className="alert alert-info" role="status">
          <PhoneIcon />
          <span>Please start from the forgot-password page to get a code.</span>
        </div>
        <Link to="/forgot-password" className="btn btn-primary btn-block">
          Go to forgot password
        </Link>
        <p className="auth-switch">
          Already verified?
          <Link to="/login">Back to sign in</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="auth-head">
        <h1>Set a new password</h1>
        <p>Phone verified for {phone}. Choose a new password.</p>
      </div>

      {formError ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{formError}</span>
        </div>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <TextField
          id="password"
          label="New password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="4–10 characters"
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

        <TextField
          id="confirmPassword"
          label="Confirm new password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          leadingIcon={<LockIcon />}
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Resetting…
            </>
          ) : (
            <>
              <CheckCircleIcon /> Reset password
            </>
          )}
        </button>
      </form>

      <p className="auth-switch">
        Need the code again?
        <Link to="/forgot-password">Request a new one</Link>
      </p>
    </AuthLayout>
  );
}