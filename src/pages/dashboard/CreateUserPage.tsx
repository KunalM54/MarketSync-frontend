import { useState, type FormEvent } from "react";
import TextField from "../../components/FormField";
import {
  AlertIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  PhoneIcon,
  UserIcon,
  UsersIcon,
} from "../../components/icons";
import { apiRequest, ApiError } from "../../lib/api";
import { digitsOnly, isValidPhone, normalizePhone } from "../../lib/phone";

interface CreateUserForm {
  name: string;
  phone: string;
  role: "CUSTOMER" | "SELLER";
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: CreateUserForm = {
  name: "",
  phone: "",
  role: "CUSTOMER",
  password: "",
  confirmPassword: "",
};

export default function CreateUserPage() {
  const [form, setForm] = useState<CreateUserForm>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setPhone = (value: string) => setForm((f) => ({ ...f, phone: digitsOnly(value) }));
  const set = (key: keyof CreateUserForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    const phone = form.phone;

    if (name.length < 3) errs.name = "Name must be at least 3 characters.";
    else if (name.length > 50) errs.name = "Name cannot exceed 50 characters.";

    if (!phone) errs.phone = "Phone number is required.";
    else if (!isValidPhone(phone)) errs.phone = "Enter a 10-digit mobile number.";

    if (form.password.length < 4) errs.password = "Password must be at least 4 characters.";
    else if (form.password.length > 10) errs.password = "Password cannot exceed 10 characters.";

    if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match.";

    return errs;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError(null);
    setCreatedUser(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError(null);
      setCreatedUser(null);
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await apiRequest("/users/create", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          phone: normalizePhone(form.phone),
          role: form.role,
          password: form.password,
        }),
      });
      setCreatedUser(form.name.trim());
      setForm(EMPTY_FORM);
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
    <div className="dash-module">
      <div className="page-head">
        <div>
          <h1>Add user</h1>
          <p className="page-sub">
            Create an account with a phone number. The user can add an email later from their
            account settings.
          </p>
        </div>
      </div>

      {createdUser ? (
        <div className="alert alert-success" role="alert">
          <CheckCircleIcon />
          <span>
            Account for {createdUser} created successfully. The user can sign in with their phone
            number.
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>
            Add another user
          </button>
        </div>
      ) : null}

      {formError ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="panel">
        <div className="panel-head">
          <h3 className="panel-title">
            <UsersIcon /> New account
          </h3>
          <span className="panel-meta">Pick a role for the new account</span>
        </div>
        <div className="panel-body">
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
              hint="Required — the user signs in with this"
            />

            <div className="field">
              <div className="field-label">
                <label htmlFor="role">Role</label>
              </div>
              <select
                id="role"
                className="input plain"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "CUSTOMER" | "SELLER" }))}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="SELLER">Seller</option>
              </select>
            </div>

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
                "Create user"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}