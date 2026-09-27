"use client";

import { Brand } from "@/components/Brand";
import { ErrorView } from "@/components/ErrorView";

export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: "100dvh", padding: "28px 24px" }}>
      <Brand />
      <div style={{ maxWidth: 560, margin: "12vh auto 0" }}>
        <ErrorView reset={reset} />
      </div>
    </div>
  );
}
