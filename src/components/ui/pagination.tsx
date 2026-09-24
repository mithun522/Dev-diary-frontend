import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import Button from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const SIBLINGS = 1; // page buttons shown on each side of the current one
// How many page buttons are shown packed against a boundary when there's no ellipsis on that
// side (e.g. near page 1: "1 2 3 4 5 … 40") - kept equal to the total window width used in the
// middle case (1 + siblings*2 + 1 + the current page itself = siblings*2 + 3) so the button count
// doesn't visibly jump depending on where the current page happens to be.
const BOUNDARY_COUNT = SIBLINGS * 2 + 3;
// Below this many total pages, there's no point collapsing anything - just show them all.
const MAX_PAGES_WITHOUT_ELLIPSIS = SIBLINGS * 2 + 5;

// Builds the page-number list with ellipsis. Always keeps the first page and the last page
// visible, plus a window of SIBLINGS around the current page - the standard numbered-pagination
// shape (same one MUI/most pagination components use), so a 40-page catalog never renders 40
// buttons at once, and the window pads out toward whichever boundary has no ellipsis:
//   buildPageList(1, 40)  -> [1, 2, 3, 4, 5, "ellipsis", 40]
//   buildPageList(20, 40) -> [1, "ellipsis", 19, 20, 21, "ellipsis", 40]
//   buildPageList(40, 40) -> [1, "ellipsis", 36, 37, 38, 39, 40]
function buildPageList(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= MAX_PAGES_WITHOUT_ELLIPSIS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - SIBLINGS, 1);
  const rightSiblingIndex = Math.min(currentPage + SIBLINGS, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: BOUNDARY_COUNT }, (_, i) => i + 1);
    return [...leftRange, "ellipsis", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = Array.from(
      { length: BOUNDARY_COUNT },
      (_, i) => totalPages - BOUNDARY_COUNT + i + 1
    );
    return [1, "ellipsis", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, "ellipsis", ...middleRange, "ellipsis", totalPages];
}

// Numbered pagination (1 2 3 ... N) with Prev/Next, replacing the old "Load More" pattern for the
// catalog's 400-problem list. `totalPages` <= 0 renders nothing (mirrors the old `hasNextPage`
// guard - a single-page or empty result set gets no pager at all).
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1 py-4", className)}
      data-cy="catalog-pagination"
    >
      <Button
        variant="outlinePrimary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="px-2 py-1 disabled:opacity-50 disabled:hover:scale-100"
        data-cy="catalog-pagination-prev"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            // Ellipsis markers carry no identity of their own; index is stable within one
            // buildPageList() call, and there are at most two of these per render.
            key={`ellipsis-${index}`}
            className="px-2 text-sm text-muted-foreground select-none"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "primary" : "outlinePrimary"}
            size="sm"
            onClick={() => onPageChange(page)}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className="min-w-[2.25rem] px-2 py-1 text-sm"
            data-cy={`catalog-pagination-page-${page}`}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outlinePrimary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="px-2 py-1 disabled:opacity-50 disabled:hover:scale-100"
        data-cy="catalog-pagination-next"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default Pagination;
export { buildPageList };
