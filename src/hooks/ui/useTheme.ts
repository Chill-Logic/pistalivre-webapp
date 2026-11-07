import { useCallback, useEffect, useState } from "react";
import { applyTheme, nextTheme, readTheme, type Theme } from "@/helpers/theme";

/** Light → dark → system cycle, persisted per device. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => applyTheme(theme), [theme]);

  const cycle = useCallback(() => setTheme(nextTheme), []);

  return { theme, setTheme, cycle };
}
