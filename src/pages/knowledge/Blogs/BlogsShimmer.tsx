import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../../components/ui/card";

export function BlogsShimmer() {
  return (
    <Card className="cursor-pointer animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="relative h-16 overflow-hidden rounded-t-lg bg-muted" />

      {/* Header */}
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between gap-2">
          <div className="h-4 w-2/3 bg-muted rounded"></div>
          <div className="h-4 w-10 bg-muted rounded"></div>
        </div>
        <div className="h-3 w-full bg-muted rounded mt-2"></div>
        <div className="h-3 w-4/5 bg-muted rounded mt-1"></div>
      </CardHeader>

      {/* Tags */}
      <CardContent className="p-4 pt-2">
        <div className="flex gap-2">
          <div className="h-5 w-12 bg-muted rounded-full"></div>
          <div className="h-5 w-12 bg-muted rounded-full"></div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0">
        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
          <div className="h-3 w-16 bg-muted rounded"></div>
          <div className="h-3 w-12 bg-muted rounded"></div>
        </div>
      </CardFooter>
    </Card>
  );
}
