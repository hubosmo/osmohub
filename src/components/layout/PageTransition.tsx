"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { PAGE_VARIANTS, PAGE_TRANSITION } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={PAGE_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={PAGE_TRANSITION}
        style={{ width: "100%", minHeight: "inherit" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
