"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/login");
    } else {
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "pharmacist":
        case "consumer":
          router.push("/dashboard");
          break;
      }
    }
  }, [router]);

  return null;
}
