import { Col, Row } from "@/components/atoms/grid";
import { DateField } from "@/components/molecules/date-field";
import { FilterSelect } from "@/components/molecules/filter-select";
import { AI_AUDIT_CHANNEL_LABELS } from "@/constants/integrations";
import type { AiClient, AiPermissions } from "@/types/ai";

type Values = Record<"canal" | "pessoa" | "app" | "ferramenta" | "resultado" | "de" | "ate", string>;

type AiAuditFiltersProps = {
  values: Values;
  onChange: (key: keyof Values, value: string) => void;
  people: AiPermissions["users"];
  tools: AiPermissions["tools"];
  clients: AiClient[];
};

/** Narrow the audit down: channel, person, app, tool, result, period. */
export function AiAuditFilters({ values, onChange, people, tools, clients }: AiAuditFiltersProps) {
  return (
    <Row className="gap-y-3">
      <Col span={6} md={4} lg={3}>
        <FilterSelect
          label="Canal"
          allLabel="Todos os canais"
          value={values.canal}
          options={Object.entries(AI_AUDIT_CHANNEL_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(v) => onChange("canal", v)}
        />
      </Col>
      <Col span={6} md={4} lg={3}>
        <FilterSelect
          label="Pessoa"
          allLabel="Todas as pessoas"
          value={values.pessoa}
          options={people.map((p) => ({ value: p.id, label: p.name }))}
          onChange={(v) => onChange("pessoa", v)}
        />
      </Col>
      <Col span={6} md={4} lg={3}>
        <FilterSelect
          label="Aplicativo"
          allLabel="Todos os aplicativos"
          value={values.app}
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          onChange={(v) => onChange("app", v)}
        />
      </Col>
      <Col span={6} md={4} lg={3}>
        <FilterSelect
          label="Ferramenta"
          allLabel="Todas as ferramentas"
          value={values.ferramenta}
          options={tools.map((t) => ({ value: t.name, label: t.title }))}
          onChange={(v) => onChange("ferramenta", v)}
        />
      </Col>
      <Col span={6} md={4} lg={3}>
        <FilterSelect
          label="Resultado"
          allLabel="Sucesso e falha"
          value={values.resultado}
          options={[
            { value: "sucesso", label: "Sucesso" },
            { value: "falha", label: "Falha" },
          ]}
          onChange={(v) => onChange("resultado", v)}
        />
      </Col>
      <Col span={6} md={4} lg={3}>
        <DateField label="De" value={values.de} onChange={(v) => onChange("de", v)} clearable />
      </Col>
      <Col span={6} md={4} lg={3}>
        <DateField label="Até" value={values.ate} onChange={(v) => onChange("ate", v)} clearable />
      </Col>
    </Row>
  );
}
