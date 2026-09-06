import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import Button from "../../../components/ui/button";
import type { SystemDesignCaseRecord } from "../../../api/services/adminSystemDesign.service";

interface CasesTableProps {
  isLoading: boolean;
  cases: SystemDesignCaseRecord[];
  onEdit: (caseItem: SystemDesignCaseRecord) => void;
  onDelete: (caseItem: SystemDesignCaseRecord) => void;
}

const CasesTable: React.FC<CasesTableProps> = ({ isLoading, cases, onEdit, onDelete }) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table data-cy="admin-sd-cases-table">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Tech Stack</TableHead>
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
            ) : cases.length > 0 ? (
              cases.map((caseItem) => (
                <TableRow key={caseItem.id} data-cy="admin-sd-cases-row">
                  <TableCell className="font-medium" data-cy="admin-sd-cases-row-title">
                    {caseItem.title}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {caseItem.summary}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(caseItem.techStack ?? []).slice(0, 3).map((tech, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {(caseItem.techStack ?? []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{caseItem.techStack.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="flex">
                    <Button className="bg-transparent" data-cy="admin-sd-cases-row-edit">
                      <Pencil
                        onClick={() => onEdit(caseItem)}
                        className="cursor-pointer text-blue-600 dark:text-blue-400"
                        size={16}
                      />
                    </Button>
                    <Button className="bg-transparent" data-cy="admin-sd-cases-row-delete">
                      <Trash2
                        onClick={() => onDelete(caseItem)}
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
                  No cases found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CasesTable;
