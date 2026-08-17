"use client";

import { useRouter } from "next/navigation";
import { LicenseActivation } from "@/components/LicenseActivation";

export default function LicenseActivationPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <LicenseActivation
        companyId={1}
        onSuccess={() => {
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
