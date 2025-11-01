import { useState } from "react";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Papa from "papaparse";
import { logger } from "../../../utils/logger";

const Todo = () => {
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const uploadFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please export your Numbers file as a CSV before uploading.");
      return;
    }

    const reader = new FileReader();

    reader.onload = ({ target }) => {
      if (!target || typeof target.result !== "string") return;

      const { data, errors } = Papa.parse<Record<string, string>>(
        target.result,
        {
          header: true,
          skipEmptyLines: true,
        }
      );

      if (errors.length > 0) {
        logger.error("CSV Parse Errors:", errors);
        alert("Error parsing CSV file. Please check the file format.");
        return;
      }

      if (!data.length) {
        logger.warn("No rows found");
        alert("No valid data found in the CSV file.");
        return;
      }

      // Extract headers dynamically
      const firstRow = data[0];
      setHeaders(Object.keys(firstRow));
      setCsvData(data);
    };

    reader.readAsText(file, "UTF-8");
  };

  const importProblems = () => {
    if (csvData.length === 0) {
      alert("Please upload a CSV before importing.");
      return;
    }

    // For now, just log the data
    logger.info("Importing problems:", csvData);
    alert(`${csvData.length} problems ready to import.`);
  };

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-6">
        <Input
          type="file"
          accept=".csv"
          placeholder="Upload file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />
        <Button variant="primary" onClick={importProblems}>
          Import
        </Button>
      </div>

      {csvData.length > 0 ? (
        <div className="mt-6 overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-gray-50">
                  {headers.map((key) => (
                    <TableCell key={key}>{row[key] || "-"}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mt-4">
          Upload a CSV to see your todo problems.
        </p>
      )}
    </div>
  );
};

export default Todo;
