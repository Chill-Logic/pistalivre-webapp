import { UserCog } from "lucide-react";
import { Col, Row } from "@/components/atoms/grid";
import { EmptyState } from "@/components/molecules/empty-state";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { UserCard, UserCardSkeleton } from "@/components/molecules/user-card";
import type { StaffUser } from "@/types/user";
import { cn } from "@/utils/cn";

type UserListProps = {
  users: StaffUser[] | undefined;
  isLoading: boolean;
  isRefreshing?: boolean;
};

export function UserList({
  users,
  isLoading,
  isRefreshing = false,
}: UserListProps) {
  if (isLoading) {
    return (
      <SkeletonRegion label="Carregando usuários…">
        <Row as="ul" className="gap-y-6">
          {Array.from({ length: 3 }, (_, index) => (
            <Col as="li" key={index} sm={6} xl={4}>
              <UserCardSkeleton />
            </Col>
          ))}
        </Row>
      </SkeletonRegion>
    );
  }

  if (!users?.length) {
    return <EmptyState icon={UserCog} title="Nenhum usuário encontrado" />;
  }

  return (
    <Row
      as="ul"
      aria-busy={isRefreshing}
      className={cn(
        "gap-y-6 transition-opacity duration-200",
        isRefreshing && "pointer-events-none opacity-60",
      )}
    >
      {users.map((user) => (
        <Col as="li" key={user.id} sm={6} xl={4}>
          <UserCard user={user} />
        </Col>
      ))}
    </Row>
  );
}
