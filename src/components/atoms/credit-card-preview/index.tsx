import Cards, { type Focused } from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { cn } from "@/utils/cn";

export type CreditCardField = Exclude<Focused, "">;

/**
 * The card drawn as it is typed (react-credit-cards-2): recognizes the brand
 * from the number and turns around to the back on the security code, so the
 * payer sees where each piece comes from. Only shows what is on the screen;
 * nothing here is sent anywhere.
 */
export function CreditCardPreview({
  number,
  name,
  expiry,
  cvc,
  focused,
  className,
}: {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  focused: CreditCardField | null;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-center [&_.rccs]:max-w-full", className)}>
      <Cards
        number={number}
        name={name}
        expiry={expiry}
        cvc={cvc}
        focused={focused ?? ""}
        locale={{ valid: "validade" }}
        placeholders={{ name: "SEU NOME" }}
      />
    </div>
  );
}
