import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

type BackLinkProps = {
  to: string;
  label: string;
};

export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="-ml-1 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:min-h-0"
    >
      <ChevronLeft className="size-4" aria-hidden />
      {label}
    </Link>
  );
}
