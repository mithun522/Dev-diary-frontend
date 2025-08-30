import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Button from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { weeklyProgress, type DSAProblem } from "../../data/dsaProblemsData";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import DsaFormModal from "./AddDsaModel";
import AxiosInstance from "../../utils/AxiosInstance";
import { DSA } from "../../constants/Api";
import AskForConfirmationModal from "../../components/AskForConfirmationModal";
import { logger } from "../../utils/logger";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import SolutionModal from "./SolutionModal";
import { useFetchDsaProblemByUser } from "../../api/hooks/useFetchDsa";
import DsaTable from "./DsaTable";
import ErrorPage from "../ErrorPage";
import { useDebounce } from "../../api/hooks/use-debounce";
import { QueryClient } from "@tanstack/react-query";
import OverallProgress from "./progress/OverallProgress";
import TopicCoverage from "./progress/TopicCoverage";

const DSAPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProblem, setSelectedProblem] = useState<DSAProblem | null>(
    null
  );
  const [isAddModelOpen, setIsAddModelOpen] = useState<boolean>(false);
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState(false);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 1000);

  const {
    data: fetchedProblems = [],
    isLoading: isLoadingFetch,
    isFetching: isFetchingFetch,
    error: errorFetch,
  } = useFetchDsaProblemByUser({
    search: debouncedSearch,
    difficulty: difficultyFilter,
  });
  const queryClient = new QueryClient();

  // Chart colors

  const deleteDsaProblem = async () => {
    await AxiosInstance.delete(`${DSA}/${selectedProblem?.id}`)
      .then((res) => {
        setSelectedProblem(null);

        if (res.status === 200) {
          toast.success(res.data);
          queryClient.invalidateQueries({ queryKey: ["dsa"] });
        }
      })
      .catch((error) => {
        const err = error as AxiosError;

        toast.error(
          (err.response?.data as { message: string }).message ||
            "Failed to Delete DSA problem"
        );
        logger.error("Error deleting DSA problem:", error);
      })
      .finally(() => {
        setIsOpenConfirmationModal(false);
      });
  };

  if (errorFetch) return <ErrorPage message="Failed to fetch DSA problems" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">DSA Tracker</h1>
        <p className="text-muted-foreground">
          Track and manage your DSA practice problems.
        </p>
      </div>

      <Tabs defaultValue="problems">
        <TabsList className="grid grid-cols-2 md:w-[400px]">
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="problems" className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1">
              <Input
                placeholder="Search problems by title or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                    <SelectItem value="attempted">Attempted</SelectItem>
                    <SelectItem value="unsolved">Unsolved</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button variant="primary" onClick={() => setIsAddModelOpen(true)}>
                Add DSAProblem
              </Button>
            </div>
          </div>
          {fetchedProblems && (
            <DsaTable
              isLoadingFetch={isLoadingFetch}
              isFetching={isFetchingFetch}
              fetchedProblems={fetchedProblems}
              setIsOpenConfirmationModal={setIsOpenConfirmationModal}
              setSelectedProblem={setSelectedProblem}
              setIsSolutionModalOpen={setIsSolutionModalOpen}
              errorFetch={errorFetch}
              isFormModalOpen={isAddModelOpen}
              setIsFormModalOpen={setIsAddModelOpen}
              setProblemData={setSelectedProblem}
            />
          )}
        </TabsContent>

        <TabsContent value="progress" className="pt-4">
          <div className="grid md:grid-cols-3 gap-6">
            <OverallProgress fetchedProblems={fetchedProblems} />

            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>
                  Problems solved in the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={weeklyProgress}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString(undefined, {
                          weekday: "short",
                        })
                      }
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`${value} problems`, "Solved"]}
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <Bar
                      dataKey="problemsSolved"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <TopicCoverage fetchedProblems={fetchedProblems} />
          </div>
        </TabsContent>
      </Tabs>
      {isAddModelOpen && (
        <DsaFormModal
          open={isAddModelOpen}
          setOpen={setIsAddModelOpen}
          problemData={selectedProblem}
        />
      )}
      {isOpenConfirmationModal && (
        <AskForConfirmationModal
          showDelete
          onCancel={() => setIsOpenConfirmationModal(false)}
          onDelete={deleteDsaProblem}
        />
      )}
      {isSolutionModalOpen && selectedProblem && (
        <SolutionModal
          selectedProblem={selectedProblem}
          setSelectedProblem={setSelectedProblem}
          open={isSolutionModalOpen}
          setOpen={setIsSolutionModalOpen}
        />
      )}
    </div>
  );
};

export default DSAPage;
