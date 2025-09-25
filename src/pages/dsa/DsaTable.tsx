import { Card, CardContent } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import type { DSAProblem } from "../../data/dsaProblemsData";
import { Badge } from "../../components/ui/badge";
import {
  getDifficultyColor,
  getStatusVariant,
} from "../../utils/colorVariations";
import {
  convertToPascalCase,
  pascalizeUnderscore,
} from "../../utils/convertToPascalCase";
import { TopicColors, type Topic } from "../../constants/Topics";
import { formatDate } from "../../utils/formatDate";
import type React from "react";
import { Pencil, Trash2 } from "lucide-react";
import Button from "../../components/ui/button";

interface DsaTableProps {
  isLoadingFetch: boolean;
  isFetching: boolean;
  errorFetch: unknown;
  fetchedProblems: DSAProblem[];
  setIsOpenConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProblem: React.Dispatch<React.SetStateAction<DSAProblem | null>>;
  setIsSolutionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFormModalOpen: boolean;
  setIsFormModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setProblemData: React.Dispatch<React.SetStateAction<DSAProblem | null>>;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const DsaTable: React.FC<DsaTableProps> = ({
  isLoadingFetch,
  fetchedProblems,
  setIsOpenConfirmationModal,
  setSelectedProblem,
  setIsSolutionModalOpen,
  setIsFormModalOpen,
  setProblemData,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  const onEdit = (problem: DSAProblem) => {
    setProblemData(problem);
    setIsFormModalOpen(true);
  };

  const onDelete = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    problem: DSAProblem
  ) => {
    e.stopPropagation();
    setSelectedProblem(problem);
    setIsOpenConfirmationModal(true);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Solved</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingFetch ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableCell key={i}>
                      <div className="h-8 w-full bg-gray-300 animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : fetchedProblems ? (
              fetchedProblems.map((problem: DSAProblem, index: number) => {
                return (
                  <TableRow
                    key={`${problem.id}-${index}`}
                    onClick={() => {
                      setSelectedProblem(problem);
                      setIsSolutionModalOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {problem.problem}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getDifficultyColor(
                          problem?.difficulty
                        )} text-white`}
                      >
                        {problem.difficulty &&
                          convertToPascalCase(problem?.difficulty)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {problem.topics &&
                          problem.topics.map((topics: Topic) => (
                            <Badge
                              key={`${problem.id}-${topics}`}
                              variant="secondary"
                              className={`text-xs ${TopicColors[topics]}`}
                            >
                              {topics && pascalizeUnderscore(topics)}
                            </Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusVariant(problem.status)}>
                        {problem.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {problem.updatedAt ? formatDate(problem.updatedAt) : "-"}
                    </TableCell>
                    <TableCell className="flex">
                      <Button className="bg-transparent">
                        <Pencil
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(problem);
                          }}
                          className="cursor-pointer text-blue-600 dark:text-blue-400"
                          size={16}
                        />
                      </Button>
                      <Button className="bg-transparent">
                        <Trash2
                          onClick={(e) => onDelete(e, problem)}
                          className="text-destructive"
                          size={18}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No problems found matching your filters.
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
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DsaTable;
