import { Col, Row } from "@/components/atoms/grid";
import { Skeleton } from "@/components/atoms/skeleton";
import { SkeletonRegion } from "@/components/molecules/skeleton-region";
import { SkeletonText } from "@/components/molecules/skeleton-text";

/** Generic page while its code chunk loads (lazy routes). */
export function PageSkeleton() {
  return (
    <SkeletonRegion className="space-y-6">
      <SkeletonText lines={["w-40 text-2xl"]} />
      <Row className="gap-y-6">
        <Col sm={6} xl={4}>
          <Skeleton className="h-32" />
        </Col>
        <Col sm={6} xl={4}>
          <Skeleton className="h-32" />
        </Col>
        <Col sm={6} xl={4} className="hidden sm:block">
          <Skeleton className="h-32" />
        </Col>
      </Row>
    </SkeletonRegion>
  );
}
