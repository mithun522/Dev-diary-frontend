import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
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
import Pagination from "../../../components/ui/pagination";
import type { CatalogProblem } from "../../../data/catalogData";
import { getDifficultyColor } from "../../../utils/colorVariations";
import { convertToPascalCase, pascalizeUnderscore } from "../../../utils/convertToPascalCase";
import { TopicColors, type Topic } from "../../../constants/Topics";

interface CatalogTableProps {
  isLoadingFetch: boolean;
  fetchedProblems: CatalogProblem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CatalogTable: React.FC<CatalogTableProps> = ({
  isLoadingFetch,
  fetchedProblems,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingFetch ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : fetchedProblems.length > 0 ? (
              fetchedProblems.map((problem) => (
                <TableRow
                  key={problem.id}
                  onClick={() => navigate(`/dsa/practice/${problem.id}`)}
                  className="cursor-pointer"
                  data-cy="catalog-row"
                >
                  <TableCell className="font-medium" data-cy="catalog-row-title">
                    {problem.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`${getDifficultyColor(problem.difficulty)} text-white`}
                      >
                        {convertToPascalCase(problem.difficulty)}
                      </Badge>
                      {typeof problem.score === "number" && (
                        <Badge variant="secondary" className="text-xs">
                          {problem.score} pts
                        </Badge>
                      )}
                    </div>
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
                  <TableCell>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dsa/practice/${problem.id}`);
                      }}
                      data-cy="catalog-row-solve"
                    >
                      Solve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No problems found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
};

export default CatalogTable;
