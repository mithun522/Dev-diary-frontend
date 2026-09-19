import { useState } from "react";
import { Search, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";
import Button from "../../../components/ui/button";
import { useDebounce } from "../../../api/hooks/use-debounce";
import {
  useCatalogLanguages,
  useCatalogLanguageTree,
  useSearchCatalogQuestions,
} from "../../../api/hooks/useTechInterviewCatalog";
import ErrorPage from "../../ErrorPage";
import CatalogQuestionRow from "./CatalogQuestionRow";

const QuestionBankTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  // Only one question's answer is ever expanded at a time (accordion semantics) — shared between
  // the topic-tree view and the search-results view since only one of them is ever on screen.
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const isSearching = debouncedSearch.trim().length > 0;

  const {
    data: languages,
    isLoading: isLoadingLanguages,
    error: languagesError,
  } = useCatalogLanguages();

  const { data: languageTree, isLoading: isLoadingTree } = useCatalogLanguageTree(
    selectedLanguage ?? ""
  );

  const {
    data: searchPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingSearch,
  } = useSearchCatalogQuestions(debouncedSearch, selectedLanguage ?? undefined);

  const searchResults = searchPages?.pages.flatMap((p) => p.results) ?? [];

  if (languagesError) return <ErrorPage message="Failed to fetch the question bank" />;

  return (
    <div className="space-y-4" data-cy="tech-interview-catalog-tab">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search the question bank..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-cy="tech-interview-catalog-search"
        />
      </div>

      {isSearching ? (
        <div className="space-y-2">
          {isLoadingSearch ? (
            <div className="h-24 w-full bg-gray-300 animate-pulse rounded" />
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.map((result) => (
                <CatalogQuestionRow
                  key={result.slug}
                  slug={result.slug}
                  question={result.question}
                  difficulty={result.difficulty}
                  subtitle={`${result.language} · ${result.topic}`}
                  expanded={expandedSlug === result.slug}
                  onToggle={() =>
                    setExpandedSlug((prev) => (prev === result.slug ? null : result.slug))
                  }
                />
              ))}
              {hasNextPage && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outlinePrimary"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              No matching questions found.
            </p>
          )}
        </div>
      ) : selectedLanguage ? (
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedLanguage(null);
              setExpandedTopic(null);
            }}
            data-cy="tech-interview-catalog-back"
          >
            <ArrowLeft size={16} className="mr-1" /> All languages
          </Button>

          {isLoadingTree ? (
            <div className="h-40 w-full bg-gray-300 animate-pulse rounded" />
          ) : (
            languageTree?.topics.map((topic) => (
              <Card key={topic.slug} data-cy="tech-interview-catalog-topic">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTopic((prev) => (prev === topic.slug ? null : topic.slug))
                  }
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div>
                    <h3 className="font-semibold">{topic.title}</h3>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    )}
                  </div>
                  {expandedTopic === topic.slug ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>

                {expandedTopic === topic.slug && (
                  <CardContent className="pt-0 space-y-2">
                    {topic.questions.map((question) => (
                      <CatalogQuestionRow
                        key={question.slug}
                        slug={question.slug}
                        question={question.question}
                        difficulty={question.difficulty}
                        expanded={expandedSlug === question.slug}
                        onToggle={() =>
                          setExpandedSlug((prev) =>
                            prev === question.slug ? null : question.slug
                          )
                        }
                      />
                    ))}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoadingLanguages ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-24 w-full bg-gray-300 animate-pulse rounded" />
            ))
          ) : languages && languages.length > 0 ? (
            languages.map((language) => (
              <Card
                key={language.language}
                onClick={() => setSelectedLanguage(language.language)}
                className="cursor-pointer hover:bg-accent"
                data-cy="tech-interview-catalog-language-card"
              >
                <CardContent className="pt-6">
                  <h3 className="font-semibold">{language.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {language.topicCount} topics &middot; {language.questionCount} questions
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-6 col-span-full">
              The question bank is empty for now.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionBankTab;
