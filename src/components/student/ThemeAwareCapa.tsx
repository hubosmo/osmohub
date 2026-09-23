"use client";

import { useEffect, useState } from "react";

function useIsDark() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const el = document.documentElement;
    const check = () => setIsDark(el.getAttribute("data-theme") !== "light");
    check();
    const obs = new MutationObserver(check);
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

type Props = {
  capaUrlDark: string | null;
  capaUrlLight: string | null;
  alt: string;
  className?: string;
};

export function ThemeAwareCapa({ capaUrlDark, capaUrlLight, alt, className }: Props) {
  const isDark = useIsDark();
  const src = isDark
    ? (capaUrlDark ?? capaUrlLight)
    : (capaUrlLight ?? capaUrlDark);
  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}
