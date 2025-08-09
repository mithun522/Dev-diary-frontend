import { EllipsisVertical } from "lucide-react";
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
import { convertToPascalCase } from "../../utils/convertToPascalCase";
import { TopicColors, type Topic } from "../../constants/Topics";
import { formatDate } from "../../utils/formatDate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import Button from "../../components/ui/button";
import type React from "react";

interface DsaTableProps {
  isLoadingFetch: boolean;
  isFetching: boolean;
  errorFetch: unknown;
  fetchedProblems: DSAProblem[];
  setIsOpenConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedProblem: React.Dispatch<React.SetStateAction<DSAProblem | null>>;
  setIsSolutionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DsaTable: React.FC<DsaTableProps> = ({
  isLoadingFetch,
  fetchedProblems,
  setIsOpenConfirmationModal,
  setSelectedProblem,
  setIsSolutionModalOpen,
}) => {
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
              fetchedProblems.map((problem: DSAProblem) => {
                return (
                  <TableRow
                    key={problem.id}
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
                          problem.topics.map((topics: Topic, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={`text-xs ${TopicColors[topics]}`}
                            >
                              {topics}
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
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            <EllipsisVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Mark as Solved</DropdownMenuItem>
                          <DropdownMenuItem>Add Solution</DropdownMenuItem>
                          <DropdownMenuItem>Add Notes</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setIsOpenConfirmationModal(true)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
      </CardContent>
    </Card>
  );
};

export default DsaTable;
