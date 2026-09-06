import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import Button from "../../../components/ui/button";
import type { ScalabilityPatternRecord } from "../../../api/services/adminSystemDesign.service";

interface PatternsTableProps {
  isLoading: boolean;
  patterns: ScalabilityPatternRecord[];
  onEdit: (pattern: ScalabilityPatternRecord) => void;
  onDelete: (pattern: ScalabilityPatternRecord) => void;
}

const PatternsTable: React.FC<PatternsTableProps> = ({
  isLoading,
  patterns,
  onEdit,
  onDelete,
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table data-cy="admin-sd-patterns-table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Use Cases</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableCell key={i}>
                      <div className="h-8 w-full bg-gray-300 animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : patterns.length > 0 ? (
              patterns.map((pattern) => (
                <TableRow key={pattern.id} data-cy="admin-sd-patterns-row">
                  <TableCell className="font-medium" data-cy="admin-sd-patterns-row-name">
                    {pattern.name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{pattern.description}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {(pattern.useCases ?? []).join(", ")}
                  </TableCell>
                  <TableCell className="flex">
                    <Button className="bg-transparent" data-cy="admin-sd-patterns-row-edit">
                      <Pencil
                        onClick={() => onEdit(pattern)}
                        className="cursor-pointer text-blue-600 dark:text-blue-400"
                        size={16}
                      />
                    </Button>
                    <Button className="bg-transparent" data-cy="admin-sd-patterns-row-delete">
                      <Trash2
                        onClick={() => onDelete(pattern)}
                        className="text-destructive cursor-pointer"
                        size={18}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No patterns found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PatternsTable;
