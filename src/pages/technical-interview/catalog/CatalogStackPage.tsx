import { useState } from "react";
import { useParams } from "react-router-dom";
import type { AxiosError } from "axios";
import { Search } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { Input } from "../../../components/ui/input";
import { useCatalogStack } from "../../../api/hooks/useTechInterviewCatalog";
import ErrorPage from "../../ErrorPage";
import CatalogBreadcrumb from "./CatalogBreadcrumb";
import CatalogTopicAccordion from "./CatalogTopicAccordion";

// A stack can have a lot of topics (AWS alone has 57) — a plain flat list would be an endless
// page, so topics are collapsible and a client-side filter narrows the topic list by
// title/description. The full tree is fetched in one request, so filtering doesn't need another
// round trip. Every topic (CatalogTopicAccordion) and every question within it
// (CatalogQuestionRow) manages its own expanded state independently — nothing here coordinates
// "only one open at a time," so opening one item never collapses, resizes, or reflows another.
const CatalogStackPage: React.FC = () => {
  const { stack = "" } = useParams<{ stack: string }>();
  const { data: stackTree, isLoading, error } = useCatalogStack(stack);
  const [topicFilter, setTopicFilter] = useState("");

  if (error) {
    const status = (error as AxiosError).response?.status;
    return (
      <ErrorPage
        message={
          status === 404
            ? "This stack doesn't exist."
            : "Failed to load this stack."
        }
      />
    );
  }

  const filteredTopics = stackTree
    ? stackTree.topics.filter((topic) => {
        const needle = topicFilter.trim().toLowerCase();
        if (!needle) return true;
        return (
          topic.title.toLowerCase().includes(needle) ||
          topic.description.toLowerCase().includes(needle)
        );
      })
    : [];

  return (
    <div className="space-y-6" data-cy="tech-interview-catalog-stack">
      {isLoading || !stackTree ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-8 w-48" />
        </div>
      ) : (
        <>
          <CatalogBreadcrumb
            items={[
              { label: "Technical Interview", to: "/technical-interview" },
              { label: "Question Bank", to: "/technical-interview/catalog" },
              { label: stackTree.categoryLabel },
              { label: stackTree.label },
            ]}
          />
          <div>
            <h1 className="text-3xl font-bold">{stackTree.label}</h1>
            <p className="text-muted-foreground">
              {stackTree.topics.length} topics in {stackTree.categoryLabel}
            </p>
          </div>
        </>
      )}

      {stackTree && stackTree.topics.length > 5 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter topics..."
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="pl-9"
            data-cy="tech-interview-catalog-topic-filter"
          />
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </Card>
          ))
        ) : filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <CatalogTopicAccordion key={topic.slug} topic={topic} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-6">
            No topics match "{topicFilter}".
          </p>
        )}
      </div>
    </div>
  );
};

export default CatalogStackPage;
