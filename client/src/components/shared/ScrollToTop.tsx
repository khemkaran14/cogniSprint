import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** SPA equivalent of Next.js's automatic scroll restoration on navigation. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
