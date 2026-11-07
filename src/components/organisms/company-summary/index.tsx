import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { InfoItem } from "@/components/molecules/info-item";
import { addressLines } from "@/helpers/customer";
import type { Company } from "@/types/company";
import { formatCnpj, formatPhone } from "@/utils/document";

/** Registration data (the one used on contracts). */
export function CompanySummary({ company }: { company: Company }) {
  const address = addressLines(company.address);
  return (
    <Card>
      <CardHeader>
        <Heading className="break-words">
          {company.tradeName ?? company.legalName}
        </Heading>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem label="Razão social">{company.legalName}</InfoItem>
          <InfoItem md={6} label="CNPJ" mono>
            {formatCnpj(company.document)}
          </InfoItem>
          <InfoItem md={6} label="Representante legal">
            {company.representative}
          </InfoItem>
          <InfoItem md={4} label="E-mail">
            {company.email}
          </InfoItem>
          <InfoItem span={6} md={4} label="Telefone">
            {company.phone ? formatPhone(company.phone) : null}
          </InfoItem>
          <InfoItem span={6} md={4} label="WhatsApp">
            {company.whatsapp ? `+${company.whatsapp}` : null}
          </InfoItem>
          <InfoItem label="Endereço">
            {address.length > 0
              ? address.map((line) => (
                  <Text key={line} inline className="block">
                    {line}
                  </Text>
                ))
              : null}
          </InfoItem>
        </Row>
      </CardContent>
    </Card>
  );
}

export function CompanySummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-1/3 text-2xl" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {[0, 1, 2, 3, 4].map((index) => (
            <Col key={index} md={6} className="space-y-2">
              <Skeleton shape="text" className="w-20 text-xs" />
              <Skeleton shape="text" className="w-40 text-sm" />
            </Col>
          ))}
        </Row>
      </CardContent>
    </Card>
  );
}
