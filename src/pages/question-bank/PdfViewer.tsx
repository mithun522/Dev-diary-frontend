import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import Button from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.4;
const SCALE_STEP = 0.2;

interface PdfViewerProps {
  fileUrl: string;
}

const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="text-center py-10 space-y-3">
        <p className="text-muted-foreground">
          Couldn't load this PDF for preview.
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Open in a new tab
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2 sticky top-0 z-10 bg-background/95 backdrop-blur py-1 w-full">
        <Button
          variant="outlinePrimary"
          size="sm"
          onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
          data-cy="pdf-viewer-prev-page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[90px] text-center">
          Page {pageNumber} of {numPages ?? "…"}
        </span>
        <Button
          variant="outlinePrimary"
          size="sm"
          onClick={() =>
            setPageNumber((p) => Math.min(numPages ?? p, p + 1))
          }
          disabled={!numPages || pageNumber >= numPages}
          data-cy="pdf-viewer-next-page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <span className="w-px h-5 bg-border mx-1" />

        <Button
          variant="outlinePrimary"
          size="sm"
          onClick={() => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP))}
          disabled={scale <= MIN_SCALE}
          data-cy="pdf-viewer-zoom-out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[45px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="outlinePrimary"
          size="sm"
          onClick={() => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP))}
          disabled={scale >= MAX_SCALE}
          data-cy="pdf-viewer-zoom-in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-md border bg-muted/20 p-4 w-full flex justify-center">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setPageNumber(1);
          }}
          onLoadError={() => setFailed(true)}
          loading={<Skeleton className="h-[600px] w-[450px]" />}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            loading={<Skeleton className="h-[600px] w-[450px]" />}
            className="shadow-md"
          />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
