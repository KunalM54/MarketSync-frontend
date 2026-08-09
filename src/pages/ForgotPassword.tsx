import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/FormField";
import { AlertIcon, BoltIcon, CheckCircleIcon, PhoneIcon } from "../components/icons";
import { apiRequest, ApiError } from "../lib/api";
import { digitsOnly, isValidPhone, normalizePhone } from "../lib/phone";

interface ForgotResponse {
  devOtp?: string;
}

interface VerifyResponse {
  resetToken?: string;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    document.title = "Forgot password — CommerceX";
  }, []);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();

    const phoneDigits = digitsOnly(phone);
    if (phoneDigits.length === 0) {
      setFieldErrors({ phone: "Enter your phone number." });
      return;
    }
    if (!isValidPhone(phoneDigits)) {
      setFieldErrors({ phone: "Enter a 10-digit mobile number." });
      return;
    }

    setSending(true);
    setFormError(null);
    setFieldErrors({});
    setSentTo(null);
    setDevOtp(null);
    setOtp("");

    try {
      const data = await apiRequest<ForgotResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifier: normalizePhone(phoneDigits) }),
      });
      setSentTo(normalizePhone(phoneDigits));
      if (data.devOtp) setDevOtp(data.devOtp);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();

    if (!otp.trim() || otp.trim().length !== 6) {
      setFieldErrors({ otp: "Enter the 6-digit code." });
      return;
    }

    setVerifying(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const data = await apiRequest<VerifyResponse>("/auth/verify-reset-otp", {
        method: "POST",
        body: JSON.stringify({ identifier: sentTo, otp: otp.trim() }),
      });
      navigate("/reset-password", {
        state: { phone: sentTo, token: data.resetToken },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-head">
        <h1>Forgot your password?</h1>
        <p>Enter your phone number and we&apos;ll send a 6-digit code.</p>
      </div>

      {formError ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{formError}</span>
        </div>
      ) : null}

      {devOtp ? (
        <div className="alert alert-info" role="status">
          <BoltIcon />
          <div>
            <strong>Demo mode</strong> — no SMS provider is connected in
            development, so here is the code:
            <code className="alert-code">{devOtp}</code>
          </div>
        </div>
      ) : null}

      <form className="auth-form" onSubmit={handleSendOtp} noValidate>
        <TextField
          id="phone"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          autoFocus
          placeholder="98765 43210"
          value={phone}
          onChange={(e) => {
            setPhone(digitsOnly(e.target.value));
            setSentTo(null);
            setDevOtp(null);
          }}
          error={fieldErrors.phone}
          leadingIcon={<PhoneIcon />}
          prefix="+91"
        />

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={sending}
        >
          {sending ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Sending OTP…
            </>
          ) : sentTo ? (
            "Resend OTP"
          ) : (
            "Send OTP"
          )}
        </button>
      </form>

      {sentTo ? (
        <form className="auth-form otp-step" onSubmit={handleVerifyOtp} noValidate>
          <div className="field">
            <div className="field-label">
              <label htmlFor="otp">Enter the 6-digit code</label>
              <span className="opt">Sent to {sentTo}</span>
            </div>
            <div className="input-wrap">
              <span className="lead" aria-hidden="true">
                <PhoneIcon />
              </span>
              <input
                id="otp"
                className={`input ${fieldErrors.otp ? "invalid" : ""}`}
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="••••••"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setFieldErrors((f) => ({ ...f, otp: "" }));
                }}
                aria-invalid={fieldErrors.otp ? true : undefined}
              />
            </div>
            {fieldErrors.otp ? (
              <span className="field-error" id="otp-error" role="alert">
                {fieldErrors.otp}
              </span>
            ) : null}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={verifying}
          >
            {verifying ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Verifying…
              </>
            ) : (
              <>
                <CheckCircleIcon /> Verify code
              </>
            )}
          </button>
        </form>
      ) : null}

      <p className="auth-switch">
        Remember it again?
        <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}