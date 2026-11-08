/**
 * Reading a boleto's barcode / "linha digitável" (Febraban standard), ported
 * from the management app (`core/payments/boleto-code.ts`). Pure reading of
 * the number — nothing talks to a bank: it lets whoever pays check the slip
 * (amount and due date come inside it) BEFORE paying.
 */

/** Bank slip (financing, supplier) × collection (utilities, taxes). */
export type BoletoKind = "BANK" | "COLLECTION";

export type BoletoCode = {
  kind: BoletoKind;
  /** The 44 barcode digits: the canonical form (what payments store). */
  barcode: string;
  /** In reais; null when the code doesn't carry it. */
  amount: number | null;
  /** ISO timestamp at midnight UTC (calendar date). Bank slips only. */
  dueDate: string | null;
  /** Issuing bank (3 digits), bank slips only. */
  bankCode: string | null;
  /** Why the code looks off (check digits). Never blocks: a warning. */
  warning: string | null;
};

export type BoletoReading =
  { ok: true; code: BoletoCode } | { ok: false; message: string };

const DAY = 86_400_000;

function digitsOf(value: string) {
  return (value ?? "").replace(/\D/g, "");
}

/** Mod 10 (check digit of the line's fields and of collection blocks). */
function mod10(block: string) {
  let sum = 0;
  let weight = 2;
  for (let i = block.length - 1; i >= 0; i--) {
    const product = Number(block[i]) * weight;
    sum += product > 9 ? product - 9 : product;
    weight = weight === 2 ? 1 : 2;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/** Collection mod 11 (weights 2..9; remainder 0/1 → 0, 10 → 1). */
function mod11Collection(block: string) {
  let sum = 0;
  let weight = 2;
  for (let i = block.length - 1; i >= 0; i--) {
    sum += Number(block[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const remainder = sum % 11;
  if (remainder === 0 || remainder === 1) return 0;
  if (remainder === 10) return 1;
  return 11 - remainder;
}

/**
 * The due-date factor counts days from a base that rolled over on
 * 2025-02-22 (9999 → 1000): the same factor can mean two dates. The one
 * near today wins (a slip being paid is from the present); otherwise the
 * old reading, as long as it is in the past.
 */
function dueDateFromFactor(factor: number, today: Date) {
  if (!factor) return null;
  const legacy = new Date(Date.UTC(1997, 9, 7) + factor * DAY);
  const current = new Date(Date.UTC(2025, 1, 22) + (factor - 1000) * DAY);
  const near = Math.abs(current.getTime() - today.getTime()) <= 5 * 365 * DAY;
  if (near) return current;
  if (legacy.getTime() <= today.getTime()) return legacy;
  return current;
}

/** Bank line (47) → barcode (44). */
function bankLineToBarcode(line: string) {
  const bank = line.slice(0, 3);
  const currency = line.slice(3, 4);
  const free1 = line.slice(4, 9);
  const dv1 = Number(line.slice(9, 10));
  const free2 = line.slice(10, 20);
  const dv2 = Number(line.slice(20, 21));
  const free3 = line.slice(21, 31);
  const dv3 = Number(line.slice(31, 32));
  const generalDv = line.slice(32, 33);
  const factorAndValue = line.slice(33, 47);
  const fieldDvOk =
    mod10(bank + currency + free1) === dv1 &&
    mod10(free2) === dv2 &&
    mod10(free3) === dv3;
  return {
    barcode:
      bank + currency + generalDv + factorAndValue + free1 + free2 + free3,
    fieldDvOk,
  };
}

/** Collection line (48) → barcode (44). */
function collectionLineToBarcode(line: string) {
  const blocks = [0, 12, 24, 36].map((at) => line.slice(at, at + 12));
  const barcode = blocks.map((block) => block.slice(0, 11)).join("");
  const useMod10 = barcode[2] === "6" || barcode[2] === "7";
  const fieldDvOk = blocks.every((block) => {
    const body = block.slice(0, 11);
    const dv = Number(block.slice(11, 12));
    return (useMod10 ? mod10(body) : mod11Collection(body)) === dv;
  });
  return { barcode, fieldDvOk };
}

function parseBank(digits: string, today: Date): BoletoCode {
  const { barcode, fieldDvOk } =
    digits.length === 47
      ? bankLineToBarcode(digits)
      : { barcode: digits, fieldDvOk: true };
  // The general check digit (position 5) is not checked, as in the
  // management app: a warning on a valid code teaches people to ignore it.
  const factor = Number(barcode.slice(5, 9));
  const cents = Number(barcode.slice(9, 19));
  return {
    kind: "BANK",
    barcode,
    amount: cents > 0 ? cents / 100 : null,
    dueDate: dueDateFromFactor(factor, today)?.toISOString() ?? null,
    bankCode: barcode.slice(0, 3),
    warning: fieldDvOk
      ? null
      : "Os dígitos verificadores da linha digitável não fecham — confira se o código foi copiado inteiro.",
  };
}

function parseCollection(digits: string): BoletoCode {
  const { barcode, fieldDvOk } =
    digits.length === 48
      ? collectionLineToBarcode(digits)
      : { barcode: digits, fieldDvOk: true };
  const cents = Number(barcode.slice(4, 15));
  return {
    kind: "COLLECTION",
    barcode,
    amount: cents > 0 ? cents / 100 : null,
    dueDate: null,
    bankCode: null,
    warning: fieldDvOk
      ? null
      : "Os dígitos verificadores não fecham — confira se o código foi copiado inteiro.",
  };
}

/**
 * Reads what was pasted: the line (47, or 48 for collection) or the barcode
 * (44), with or without punctuation. Only a wrong length fails; check digits
 * that don't add up are a warning (whoever holds the slip decides).
 */
export function readBoletoCode(
  input: string,
  today: Date = new Date(),
): BoletoReading {
  const digits = digitsOf(input);
  if (!digits) return { ok: false, message: "Cole o código do boleto." };
  if (digits.length === 48 || (digits.length === 44 && digits[0] === "8")) {
    return { ok: true, code: parseCollection(digits) };
  }
  if (digits.length === 47 || digits.length === 44) {
    return { ok: true, code: parseBank(digits, today) };
  }
  return {
    ok: false,
    message: `O código tem ${digits.length} dígitos — um boleto tem 47 (ou 48, de convênio/tributo) na linha digitável, ou 44 no código de barras.`,
  };
}

/** The canonical barcode of a stored code (falls back to its digits). */
export function canonicalBarcode(value: string) {
  const reading = readBoletoCode(value);
  return reading.ok ? reading.code.barcode : digitsOf(value);
}
