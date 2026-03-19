"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const transition = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...transition, delay }}>
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.div>
  );
}
