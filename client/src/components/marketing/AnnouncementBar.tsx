import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-[var(--color-brand-navy)] text-white">
      <div className="container-page flex items-center justify-center gap-2 py-2 text-center text-xs font-medium sm:text-sm">
        <span>Enrollment is closed while the complete curriculum is authored and reviewed.</span>
        <Link to="/pricing" className="inline-flex items-center gap-1 font-semibold text-[var(--color-brand-aqua)] hover:underline">
          See availability <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
