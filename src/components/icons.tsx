import type { ReactNode } from "react";

type IconProps = { size?: number };

const base = (size: number | undefined, children: ReactNode) => (
  <svg
    width={size ?? 18}
    height={size ?? 18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/* ---------- auth ---------- */

export const MailIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ));

export const LockIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ));

export const UserIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ));

export const PhoneIcon = ({ size }: IconProps) =>
  base(size, (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
  ));

export const EyeIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ));

export const EyeOffIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M9.9 4.2A9.8 9.8 0 0 1 12 4c6.5 0 10 7 10 7a17.9 17.9 0 0 1-2.2 3.2M6.6 6.6A17.6 17.6 0 0 0 2 12s3.5 7 10 7a9.9 9.9 0 0 0 4.4-1M3 3l18 18" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ));

export const AlertIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16.5v.5" />
    </>
  ));

export const CheckCircleIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ));

/* ---------- dashboard: navigation ---------- */

export const HomeIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </>
  ));

export const BoxIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </>
  ));

export const LayersIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </>
  ));

export const CartIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="17" cy="20" r="1.6" />
      <path d="M3 3h2l2.6 12.4a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
    </>
  ));

export const UsersIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M16.5 14.6c2.8.3 5 2 5 5.4" />
    </>
  ));

export const StoreIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M3 9 4.5 3h15L21 9" />
      <path d="M4 9v12h16V9" />
      <path d="M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
      <path d="M9 21v-6h6v6" />
    </>
  ));

export const CreditCardIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </>
  ));

export const ChartIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-5 3 3 5-7" />
    </>
  ));

export const SettingsIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>
  ));

export const StarIcon = ({ size }: IconProps) =>
  base(size, (
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z" />
  ));

export const WalletIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M2 7h17a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h13" />
      <path d="M15 13h6" />
    </>
  ));

export const MapPinIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ));

export const HeartIcon = ({ size }: IconProps) =>
  base(size, (
    <path d="M12 20s-7-4.5-9.5-9A5.2 5.2 0 0 1 12 6.4 5.2 5.2 0 0 1 21.5 11C19 15.5 12 20 12 20Z" />
  ));

export const TruckIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M2 5h12v11H2z" />
      <path d="M14 9h4l4 4v3h-3" />
      <circle cx="6.5" cy="18.5" r="1.5" />
      <circle cx="17.5" cy="18.5" r="1.5" />
    </>
  ));

export const PlusIcon = ({ size }: IconProps) =>
  base(size, <path d="M12 5v14M5 12h14" />);

/* ---------- dashboard: chrome ---------- */

export const BellIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ));

export const SearchIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ));

export const MenuIcon = ({ size }: IconProps) =>
  base(size, <path d="M3 6h18M3 12h18M3 18h18" />);

export const LogoutIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ));

export const TrendingUpIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ));

export const TrendingDownIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="m3 7 6 6 4-4 8 8" />
      <path d="M15 17h6v-6" />
    </>
  ));

export const EditIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ));

export const ImageIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-4.5-4.5L6 21" />
    </>
  ));

export const BoltIcon = ({ size }: IconProps) =>
  base(size, <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />);

export const TrashIcon = ({ size }: IconProps) =>
  base(size, (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </>
  ));
