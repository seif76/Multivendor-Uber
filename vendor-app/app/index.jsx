

import "../global.css";
import { useRouter, useRootNavigationState } from "expo-router";
import { useEffect } from "react";

export default function RedirectPage() {
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/vendor/home");
    }, 100); // wait 100ms for layout mount
    return () => clearTimeout(timer);
  }, []);

  return null; // no UI — pure redirect
}