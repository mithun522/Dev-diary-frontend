import { useSearchParams } from "react-router-dom";
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

const DSA_TABS = ["curriculum", "practice", "progress", "todo"] as const;
type DSATab = (typeof DSA_TABS)[number];

const DSAPage: React.FC = () => {
  // The active tab lives in the URL (?tab=practice) rather than just Tabs' own uncontrolled
  // state, so navigating into a problem and hitting "back" lands you back on the tab you were
  // on instead of always resetting to the first one.
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: DSATab = DSA_TABS.includes(tabParam as DSATab)
    ? (tabParam as DSATab)
    : "curriculum";

  return (
    <div className="space-y-6" data-cy="dsa-page">
      <div>
        <h1 className="text-3xl font-bold">DSA Prep</h1>
        <p className="text-muted-foreground">
          Learn the basics, practice problems, and track your progress.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.set("tab", value);
              return next;
            },
            { replace: true }
          )
        }
      >
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
