import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import type { QuestionBankFile } from "../../data/questionBankData";
import { getFilePreviewKind } from "../../utils/fileType";
import PdfViewer from "./PdfViewer";

interface FileViewerModalProps {
  file: QuestionBankFile | null;
  onClose: () => void;
}

const CsvPreview = ({ fileUrl }: { fileUrl: string }) => {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setRows(null);
    setError(false);

    Papa.parse<string[]>(fileUrl, {
      download: true,
      complete: (result) => setRows(result.data.filter((row) => row.length)),
      error: () => setError(true),
    });
  }, [fileUrl]);

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn't load this CSV for preview.
      </p>
    );
  }

  if (!rows) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  const [header, ...body] = rows;

  return (
    <div className="max-h-[70vh] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {header.map((cell, i) => (
              <TableHead key={i}>{cell}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {body.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const TextPreview = ({ fileUrl }: { fileUrl: string }) => {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setText(null);
    setError(false);

    fetch(fileUrl)
      .then((res) => res.text())
      .then(setText)
      .catch(() => setError(true));
  }, [fileUrl]);

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Couldn't load this file for preview.
      </p>
    );
  }

  if (text === null) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  return (
    <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">
      {text}
    </pre>
  );
};

const FileViewerModal = ({ file, onClose }: FileViewerModalProps) => {
  if (!file) return null;

  const kind = getFilePreviewKind(file.fileName, file.fileType);

  return (
    <Dialog open={!!file} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        onClose={onClose}
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        data-cy="question-bank-viewer-modal"
      >
        <DialogHeader>
          <DialogTitle className="truncate">{file.fileName}</DialogTitle>
        </DialogHeader>

        {kind === "pdf" && <PdfViewer fileUrl={file.downloadUrl} />}

        {kind === "image" && (
          <img
            src={file.downloadUrl}
            alt={file.fileName}
            className="max-h-[75vh] w-auto mx-auto rounded-md"
          />
        )}

        {kind === "csv" && <CsvPreview fileUrl={file.downloadUrl} />}

        {kind === "text" && <TextPreview fileUrl={file.downloadUrl} />}

        {kind === "other" && (
          <div className="text-center py-10 space-y-3">
            <p className="text-muted-foreground">
              Preview isn't available for this file type.
            </p>
            <a
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              data-cy="question-bank-open-in-new-tab"
            >
              Open in a new tab
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerModal;
