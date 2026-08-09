import { useCallback, useEffect, useState } from "react";
import { apiRequest, ApiError } from "../../lib/api";
import DataTable, { type Column } from "../../components/dashboard/DataTable";
import { AlertIcon, UserIcon, UsersIcon } from "../../components/icons";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isPhoneVerified: boolean;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  isActive: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrator",
  SELLER: "Seller",
  CUSTOMER: "Customer",
};

export default function UsersPage({
  roleFilter,
  title,
  sub,
}: {
  roleFilter: "CUSTOMER" | "SELLER";
  title: string;
  sub: string;
}) {
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setUsers(null);
    try {
      const data = await apiRequest<ManagedUser[]>("/users/getAll");
      setUsers(data.filter((u) => u.role === roleFilter));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load users.");
    }
  }, [roleFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const verified = (users ?? []).filter((u) => u.isPhoneVerified).length;

  const columns: Column<ManagedUser>[] = [
    { key: "name", header: "Name", render: (u) => <span className="cell-strong">{u.name}</span> },
    { key: "email", header: "Email", render: (u) => <span className="cell-muted">{u.email}</span> },
    { key: "phone", header: "Phone", render: (u) => (u.phone ? <span className="mono">{u.phone}</span> : <span className="cell-muted">—</span>) },
    {
      key: "verification",
      header: "Phone verified",
      render: (u) =>
        u.isPhoneVerified ? (
          <span className="badge badge-success">Verified</span>
        ) : (
          <span className="badge badge-warning">Unverified</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) =>
        u.isActive ? (
          <span className="badge badge-info">Active</span>
        ) : (
          <span className="badge badge-danger">Inactive</span>
        ),
    },
  ];

  return (
    <div className="dash-module">
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p className="page-sub">
            {sub} {users ? `· ${users.length} total, ${verified} with verified phone.` : ""}
          </p>
        </div>
      </div>

      {error ? (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      ) : null}

      {users === null ? (
        <div className="store-state">
          <span className="spinner" aria-hidden="true" />
          <p>Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <div className="module-empty">
          <span className="module-empty-ico">
            {roleFilter === "SELLER" ? <UsersIcon /> : <UserIcon />}
          </span>
          <h2>No {roleFilter.toLowerCase()} accounts</h2>
          <p>Accounts appear here as people sign up on the platform.</p>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-head">
            <h3 className="panel-title">
              {roleFilter === "SELLER" ? <UsersIcon /> : <UserIcon />} {ROLE_LABEL[roleFilter]}s
            </h3>
            <span className="panel-meta">{users.length} accounts</span>
          </div>
          <div className="panel-body flush">
            <DataTable columns={columns} rows={users} />
          </div>
        </div>
      )}
    </div>
  );
}