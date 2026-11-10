import {
  BadgeCheck,
  Bike,
  Car,
  Clock,
  Headset,
  MapPin,
  ShieldCheck,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Icons a landing "Vantagem" can use (the editor shows the labels). */
export const FEATURE_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  wrench: { label: "Manutenção", icon: Wrench },
  shield: { label: "Segurança", icon: ShieldCheck },
  wallet: { label: "Pagamento", icon: Wallet },
  clock: { label: "Tempo", icon: Clock },
  bike: { label: "Moto", icon: Bike },
  car: { label: "Carro", icon: Car },
  headset: { label: "Atendimento", icon: Headset },
  check: { label: "Aprovado", icon: BadgeCheck },
  pin: { label: "Local", icon: MapPin },
};
