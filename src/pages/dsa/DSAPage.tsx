import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import OverallProgress from "./progress/OverallProgress";
import TopicCoverage from "./progress/TopicCoverage";
import WeeklyActivity from "./progress/WeeklyActivity";
import Todo from "./todo/Todo";
import PracticeTab from "./practice/PracticeTab";
import CurriculumTab from "./curriculum/CurriculumTab";

const DSAPage: React.FC = () => {
  return (
    <div className="space-y-6" data-cy="dsa-page">
      <div>
        <h1 className="text-3xl font-bold">DSA Prep</h1>
        <p className="text-muted-foreground">
          Learn the basics, practice problems, and track your progress.
        </p>
      </div>

      <Tabs defaultValue="curriculum">
        <TabsList className="grid grid-cols-4 md:w-[500px]">
          <TabsTrigger value="curriculum" data-cy="dsa-tab-curriculum">
            Basics
          </TabsTrigger>
          <TabsTrigger value="practice" data-cy="dsa-tab-practice">
            Practice
          </TabsTrigger>
          <TabsTrigger value="progress" data-cy="dsa-tab-progress">
            Progress
          </TabsTrigger>
          <TabsTrigger value="todo" data-cy="dsa-tab-todo">
            Todo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="pt-4">
          <CurriculumTab />
        </TabsContent>

        <TabsContent value="practice" className="pt-4">
          <PracticeTab />
        </TabsContent>

        <TabsContent value="progress" className="pt-4">
          <div className="grid md:grid-cols-3 gap-6">
            <OverallProgress />
            <WeeklyActivity />
            <TopicCoverage />
          </div>
        </TabsContent>
        <TabsContent value="todo" className="pt-4">
          <Todo />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DSAPage;
