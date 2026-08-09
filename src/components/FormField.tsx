import type { InputHTMLAttributes, ReactNode } from "react";
import { AlertIcon } from "./icons";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  leadingIcon: ReactNode;
  trailing?: ReactNode;
  /** Non-editable badge shown inside the field, before the text (e.g. "+91"). */
  prefix?: ReactNode;
}

export default function TextField({
  id,
  label,
  hint,
  error,
  leadingIcon,
  trailing,
  prefix,
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
        {prefix ? (
          <span className="phone-prefix" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          className={[
            "input",
            trailing ? "has-trailing" : "",
            prefix ? "has-prefix" : "",
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
          <AlertIcon />
          <span>{error}</span>
        </span>
      ) : null}
    </div>
  );
}
