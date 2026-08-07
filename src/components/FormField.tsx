import type { InputHTMLAttributes, ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  leadingIcon: ReactNode;
  trailing?: ReactNode;
}

export default function TextField({
  id,
  label,
  hint,
  error,
  leadingIcon,
  trailing,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <div className="field">
      <div className="field-label">
        <label htmlFor={id}>{label}</label>
        {hint ? <span className="opt">{hint}</span> : null}
      </div>
      <div className="input-wrap">
        <span className="lead" aria-hidden="true">
          {leadingIcon}
        </span>
        <input
          id={id}
          className={[
            "input",
            trailing ? "has-trailing" : "",
            error ? "invalid" : "",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {trailing}
      </div>
      {error ? (
        <span className="field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
