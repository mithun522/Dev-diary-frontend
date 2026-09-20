import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import type { CatalogTopic } from "../../../data/techInterviewCatalogData";
import CatalogQuestionRow from "./CatalogQuestionRow";

// Owns its own expanded state, independent of every other topic on the page. This is the fix for
// the old "expand topic 3, and topic 1 (which was open and taller) collapses, so the page jumps
// and different content ends up under your scroll position" bug: with no shared "which topic is
// open" state, opening one topic can never collapse another, so nothing above the click point
// ever changes size and the page never jumps.
const CatalogTopicAccordion: React.FC<{ topic: CatalogTopic }> = ({ topic }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card data-cy="tech-interview-catalog-topic">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <h3 className="font-semibold">{topic.title}</h3>
          {topic.description && (
            <p className="text-sm text-muted-foreground">{topic.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {topic.questions.length} questions
          </p>
        </div>
        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>

      {expanded && (
        <CardContent className="pt-0 space-y-2">
          {topic.questions.map((question) => (
            <CatalogQuestionRow
              key={question.slug}
              slug={question.slug}
              question={question.question}
              difficulty={question.difficulty}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
};

export default CatalogTopicAccordion;
