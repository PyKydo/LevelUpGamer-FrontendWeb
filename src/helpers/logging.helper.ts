const isProduction =
  typeof import.meta !== "undefined" && import.meta.env?.MODE === "production";

export const reportError = (context: string, error: unknown): void => {
  if (typeof console === "undefined" || isProduction) {
    return;
  }
  console.error(`[LevelUpGamer] ${context}`, error);
};
