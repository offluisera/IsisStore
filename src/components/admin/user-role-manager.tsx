"use client";

import * as React from "react";
import { updateUserRoleAction } from "@/features/admin/actions";
import { Loader2 } from "lucide-react";

interface UserRoleManagerProps {
  userId: string;
  currentRole: "customer" | "admin";
  currentUserId: string;
}

export function UserRoleManager({
  userId,
  currentRole,
  currentUserId,
}: UserRoleManagerProps) {
  const [role, setRole] = React.useState(currentRole);
  const [loading, setLoading] = React.useState(false);
  const isSelf = userId === currentUserId;

  const handleChange = async (newRole: "customer" | "admin") => {
    if (newRole === role) return;

    if (isSelf && newRole !== "admin") {
      alert("Por segurança, você não pode remover seu próprio acesso administrativo.");
      return;
    }

    if (
      !confirm(
        `Deseja alterar o privilégio deste usuário para "${
          newRole === "admin" ? "Administrador" : "Cliente Comum"
        }"?`
      )
    ) {
      return;
    }

    setLoading(true);
    setRole(newRole);

    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (!res.success) {
        setRole(role);
        alert(res.message);
      }
    } catch {
      setRole(role);
      alert("Falha ao atualizar papel do usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <select
        value={role}
        disabled={loading || isSelf}
        onChange={(e) => handleChange(e.target.value as "customer" | "admin")}
        className={`border rounded-xl px-2.5 py-1 text-[11px] font-semibold focus:outline-none transition-colors ${
          role === "admin"
            ? "border-primaria/40 text-primaria font-bold bg-primaria-soft/20 dark:bg-primaria/10 dark:border-primaria/40"
            : "bg-white dark:bg-[#151012] border-borda dark:border-[#38262C] text-texto-medio dark:text-[#F8EFF1]"
        } ${isSelf ? "cursor-not-allowed opacity-80" : ""}`}
        title={isSelf ? "Não é possível alterar seu próprio privilégio" : undefined}
      >
        <option value="customer" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Cliente</option>
        <option value="admin" className="dark:bg-[#151012] dark:text-[#F8EFF1]">Administrador</option>
      </select>

      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primaria" />}
      {isSelf && (
        <span className="text-[10px] text-texto-claro font-medium">(Você)</span>
      )}
    </div>
  );
}
