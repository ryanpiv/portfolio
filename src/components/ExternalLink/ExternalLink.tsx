import type { AnchorHTMLAttributes } from "react";

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "target" | "rel"
> & {
  href: string;
};

/** Anchor that opens in a new tab with the safe rel defaults. Unstyled. */
export function ExternalLink({ children, ...rest }: ExternalLinkProps) {
  return (
    <a {...rest} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
