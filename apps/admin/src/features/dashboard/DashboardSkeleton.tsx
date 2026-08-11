import { Card } from "../../components/Card";
import { Skeleton } from "../../components/Skeleton";

export function DashboardSkeleton() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-24" />
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <Skeleton className="mb-4 h-4 w-40" />
        <Skeleton className="h-40 w-full" />
      </Card>
    </div>
  );
}
