"use client";

import { useRouter } from "next/navigation";
import { LicenseActivation } from "@/components/LicenseActivation";

export default function LicenseActivationPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 font-sans relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-100/50 via-[#FAF8F5] to-[#FAF8F5] pointer-events-none" />
      <LicenseActivation
        companyId={1}
        onSuccess={() => {
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
