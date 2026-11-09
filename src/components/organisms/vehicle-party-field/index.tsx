import { useState } from "react";
import { Box } from "@/components/atoms/box";
import { RemoteCombobox } from "@/components/molecules/remote-combobox";
import { SegmentedField } from "@/components/molecules/segmented-field";
import { usePartner } from "@/hooks/api/gestao/partners/usePartners";
import { usePartnerOptions } from "@/hooks/ui/useRemoteOptions";
import type { VehiclePartnerRef } from "@/types/vehicle";

const KIND_OPTIONS = [
  { value: "company", label: "Empresa" },
  { value: "partner", label: "Parceiro" },
];

type VehiclePartyFieldProps = {
  label: string;
  /** null = the company; "" = a partner not chosen yet; else the partner id. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** The saved partner (edit), so its name shows without a request. */
  known?: VehiclePartnerRef | null;
  error?: string;
};

/**
 * One party on the vehicle's papers (title holder or owner): the company or a
 * partner picked from a server-side search.
 */
export function VehiclePartyField({
  label,
  value,
  onChange,
  known,
  error,
}: VehiclePartyFieldProps) {
  const picker = usePartnerOptions();
  const [picked, setPicked] = useState<VehiclePartnerRef | null>(null);
  const nameOf = (id: string) =>
    picked?.partnerId === id
      ? picked.name
      : known?.partnerId === id
        ? known.name
        : undefined;
  const missingName = value ? !nameOf(value) : false;
  // Prefilled from the URL: look the name up.
  const fetched = usePartner(missingName && value ? value : "");
  const selectedLabel = value
    ? (nameOf(value) ?? fetched.data?.name)
    : undefined;

  return (
    <Box className="space-y-3">
      <SegmentedField
        label={label}
        value={value === null ? "company" : "partner"}
        options={KIND_OPTIONS}
        onChange={(next) => onChange(next === "company" ? null : (value ?? ""))}
        error={value === null ? error : undefined}
      />
      {value !== null && (
        <RemoteCombobox
          label="Parceiro"
          value={value}
          selectedLabel={selectedLabel}
          options={picker.options}
          isLoading={picker.isLoading}
          search={picker.search}
          onSearchChange={picker.setSearch}
          onChange={(option) => {
            setPicked({ partnerId: option.value, name: option.label });
            onChange(option.value);
          }}
          placeholder="Escolha o parceiro"
          searchPlaceholder="Nome ou documento…"
          error={error}
        />
      )}
    </Box>
  );
}
