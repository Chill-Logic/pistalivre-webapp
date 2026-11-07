import { Badge } from "@/components/atoms/badge";
import { Box } from "@/components/atoms/box";
import { Card, CardContent, CardHeader } from "@/components/atoms/card";
import { Col, Row } from "@/components/atoms/grid";
import { Heading } from "@/components/atoms/heading";
import { Skeleton } from "@/components/atoms/skeleton";
import { InfoItem } from "@/components/molecules/info-item";
import { LABEL_MAPS } from "@/constants/label-maps";
import { useLabels } from "@/hooks/ui/useLabels";
import type { StaffUserDetail } from "@/types/user";
import { formatCpf } from "@/utils/document";
import { formatCalendarDate, formatDateTime } from "@/utils/format";

export function UserSummary({ user }: { user: StaffUserDetail }) {
  const { label } = useLabels();
  return (
    <Card>
      <CardHeader>
        <Box className="flex flex-wrap items-start justify-between gap-2">
          <Heading className="min-w-0 break-words">{user.name}</Heading>
          <Badge variant={user.role === "ADMIN" ? "neutral" : "outline"}>
            {label(LABEL_MAPS.userRole, user.role)}
          </Badge>
        </Box>
      </CardHeader>
      <CardContent>
        <Row as="dl" className="gap-y-4">
          <InfoItem md={6} label="E-mail">
            {user.email}
          </InfoItem>
          <InfoItem span={6} md={3} label="CPF" mono>
            {user.cpf ? formatCpf(user.cpf) : null}
          </InfoItem>
          <InfoItem span={6} md={3} label="Nascimento">
            {user.birthDate ? formatCalendarDate(user.birthDate) : null}
          </InfoItem>
          <InfoItem md={6} label="Último acesso">
            {user.lastLoginAt
              ? formatDateTime(user.lastLoginAt)
              : "Nunca acessou"}
          </InfoItem>
          <InfoItem md={6} label="Cadastrado em">
            {formatDateTime(user.createdAt)}
          </InfoItem>
        </Row>
      </CardContent>
    </Card>
  );
}

export function UserSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton shape="text" className="w-1/3 text-2xl" />
      </CardHeader>
      <CardContent>
        <Row className="gap-y-4">
          {[0, 1, 2, 3].map((index) => (
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
