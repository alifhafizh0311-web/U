import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

// Functional ErrorBoundary placeholder (lint issues with class components)
export default function ErrorBoundary({ children }: Props) {
  return <>{children}</>;
}
