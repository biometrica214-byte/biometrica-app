import type { Metadata } from "next";
import { getProfile, getSessionUser } from "@/lib/data";
import styles from "../pages.module.css";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const [user, profile] = await Promise.all([getSessionUser(), getProfile()]);
  if (!user || !profile) return null; // o layout já garante ambos

  return (
    <>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Conta</p>
        <h1 className={styles.title}>Perfil</h1>
        <p className={styles.lead}>Pedimos apenas o que a Biométrica usa. Cada campo explica por quê.</p>
      </header>
      <div className={styles.panel}>
        <ProfileForm profile={profile} email={user.email} />
      </div>
    </>
  );
}
