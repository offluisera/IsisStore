import { redirect } from "next/navigation";

export default function AdminQrCodesRedirectPage() {
  redirect("/admin/configuracoes?tab=qrcodes");
}

