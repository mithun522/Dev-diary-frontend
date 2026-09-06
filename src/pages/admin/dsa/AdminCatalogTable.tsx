import type React from "react";
import { Pencil, Trash2 } from "lucide-react";
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
import Button from "../../../components/ui/button";
import { getDifficultyColor } from "../../../utils/colorVariations";
import {
  convertToPascalCase,
  pascalizeUnderscore,
} from "../../../utils/convertToPascalCase";
import { TopicColors, type Topic } from "../../../constants/Topics";
import type { CatalogProblem } from "../../../data/catalogData";

interface AdminCatalogTableProps {
  isLoading: boolean;
  problems: CatalogProblem[];
  onEdit: (problem: CatalogProblem) => void;
  onDelete: (problem: CatalogProblem) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const AdminCatalogTable: React.FC<AdminCatalogTableProps> = ({
  isLoading,
  problems,
  onEdit,
  onDelete,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableCell key={i}>
                      <div className="h-8 w-full bg-gray-300 animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : problems && problems.length > 0 ? (
              problems.map((problem) => (
                <TableRow key={problem.id} data-cy="admin-catalog-row">
                  <TableCell
                    className="font-medium"
                    data-cy="admin-catalog-row-title"
                  >
                    {problem.title}
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground text-sm"
                    data-cy="admin-catalog-row-slug"
                  >
                    {problem.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getDifficultyColor(problem.difficulty)} text-white`}
                    >
                      {convertToPascalCase(problem.difficulty)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {problem.topics?.map((topic: Topic) => (
                        <Badge
                          key={`${problem.id}-${topic}`}
                          variant="secondary"
                          className={`text-xs ${TopicColors[topic]}`}
                        >
                          {pascalizeUnderscore(topic)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="flex">
                    <Button
                      className="bg-transparent"
                      data-cy="admin-catalog-row-edit"
                    >
                      <Pencil
                        onClick={() => onEdit(problem)}
                        className="cursor-pointer text-blue-600 dark:text-blue-400"
                        size={16}
                      />
                    </Button>
                    <Button
                      className="bg-transparent"
                      data-cy="admin-catalog-row-delete"
                    >
                      <Trash2
                        onClick={() => onDelete(problem)}
                        className="text-destructive cursor-pointer"
                        size={18}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6"
                  data-cy="admin-catalog-no-data"
                >
                  No catalog problems found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {hasNextPage && (
          <div className="flex justify-center mt-4 mb-4">
            <Button
              variant="outlinePrimary"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-4 py-2 text-sm rounded-lg disabled:opacity-50"
              data-cy="admin-catalog-load-more"
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCatalogTable;
