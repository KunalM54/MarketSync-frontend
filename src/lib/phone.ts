export const COUNTRY_CODE = "+91";

/** Digits only, trimmed to the last 10 (handles a pasted "+91xxxxxxxxxx"). */
export const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(-10);

export const isValidPhone = (value: string) => digitsOnly(value).length === 10;

/** Build the E.164 value we send to the API, e.g. "+919876543210". */
export const normalizePhone = (raw: string) => {
  const d = digitsOnly(raw);
  return d ? `${COUNTRY_CODE}${d}` : "";
};