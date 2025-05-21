import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import Button from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "../../components/ui/table";
import {
  Search,
  FileText,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import {
  systemDesignCases,
  metricsData,
  scalabilityPatterns,
  type SystemDesignCase,
} from "../../data/systemDesignData";

const SystemDesignPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<SystemDesignCase | null>(
    null
  );
  const [savedCases, setSavedCases] = useState<string[]>(["sdc1", "sdc4"]);

  // Filter cases based on search
  const filteredCases = systemDesignCases.filter(
    (caseItem) =>
      searchQuery === "" ||
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.techStack.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const toggleSave = (caseId: string) => {
    if (savedCases.includes(caseId)) {
      setSavedCases(savedCases.filter((id) => id !== caseId));
    } else {
      setSavedCases([...savedCases, caseId]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Design Studio</h1>
        <p className="text-muted-foreground">
          Learn and practice system design concepts.
        </p>
      </div>

      <Tabs defaultValue="cases">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="cases">Case Studies</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* Case Studies Tab */}
        <TabsContent value="cases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                {filteredCases.map((caseItem) => (
                  <Card
                    key={caseItem.id}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedCase?.id === caseItem.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedCase(caseItem)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          {caseItem.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="md"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(caseItem.id);
                          }}
                        >
                          {savedCases.includes(caseItem.id) ? (
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {caseItem.summary}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {caseItem.techStack.slice(0, 3).map((tech, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                        {caseItem.techStack.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{caseItem.techStack.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredCases.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No cases match your search.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              {selectedCase ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedCase.title}</CardTitle>
                    <CardDescription>{selectedCase.summary}</CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedCase.techStack.map((tech, idx) => (
                        <Badge key={idx} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Problem Statement
                      </h3>
                      <p className="text-muted-foreground">
                        {selectedCase.problem}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Requirements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">
                            Functional Requirements
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {selectedCase.requirements.functional.map(
                              (req, idx) => (
                                <li key={idx}>{req}</li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">
                            Non-functional Requirements
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {selectedCase.requirements.nonFunctional.map(
                              (req, idx) => (
                                <li key={idx}>{req}</li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        System Architecture
                      </h3>
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <div className="border rounded bg-background p-4 overflow-auto">
                          <pre className="text-xs">{selectedCase.diagram}</pre>
                        </div>
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          Diagram representation (would be rendered with
                          Mermaid.js)
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Trade-offs</h3>
                      <div className="space-y-2">
                        {selectedCase.tradeoffs.map((tradeoff, idx) => (
                          <div key={idx} className="border rounded-md p-4">
                            <h4 className="font-medium">{tradeoff.title}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                  Pros:
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                                  {tradeoff.pros.map((pro, i) => (
                                    <li key={i}>{pro}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                  Cons:
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                                  {tradeoff.cons.map((con, i) => (
                                    <li key={i}>{con}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedCase.resources && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Additional Resources
                        </h3>
                        <ul className="space-y-1">
                          {selectedCase.resources.map((resource, idx) => (
                            <li key={idx}>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                {resource.title}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                      Created:{" "}
                      {new Date(selectedCase.createdAt).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outlinePrimary"
                      size="sm"
                      onClick={() => toggleSave(selectedCase.id)}
                    >
                      {savedCases.includes(selectedCase.id) ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] border rounded-lg">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">
                    Select a Case Study
                  </h3>
                  <p className="text-center text-muted-foreground max-w-md">
                    Choose a system design case from the list to view detailed
                    information, architecture diagrams, and trade-offs.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scalabilityPatterns.map((pattern) => (
              <Card key={pattern.id} className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle>{pattern.name}</CardTitle>
                  <CardDescription>{pattern.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Use Cases</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {pattern.useCases.map((useCase, idx) => (
                          <li key={idx}>{useCase}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Key Benefits</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {pattern.benefits.map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outlinePrimary" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New System Metrics</CardTitle>
                <CardDescription>
                  Log performance metrics for your system design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">System Name</label>
                    <Input placeholder="e.g., User Authentication Service" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Environment</label>
                    <Select defaultValue="production">
                      <SelectTrigger>
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      QPS (Queries Per Second)
                    </label>
                    <Input type="number" placeholder="e.g., 1000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Latency (ms)</label>
                    <Input type="number" placeholder="e.g., 250" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Storage (GB)</label>
                    <Input type="number" placeholder="e.g., 500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Cache Hit Ratio (%)
                    </label>
                    <Input type="number" placeholder="e.g., 85" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Additional Notes
                  </label>
                  <Textarea placeholder="Any other important metrics or contextual information..." />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button className="w-full">Save Metrics</Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Metrics</CardTitle>
                  <CardDescription>
                    Compare performance across your systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>System</TableHead>
                        <TableHead>QPS</TableHead>
                        <TableHead>Latency</TableHead>
                        <TableHead>Cache Hit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metricsData.map((metric) => (
                        <TableRow key={metric.id}>
                          <TableCell className="font-medium">
                            {metric.system}
                          </TableCell>
                          <TableCell>{metric.qps.toLocaleString()}</TableCell>
                          <TableCell>{metric.latency} ms</TableCell>
                          <TableCell>{metric.cacheHitRatio}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metricsData.map((metric) => (
                      <div key={metric.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{metric.system}</span>
                          <span>{metric.storage} GB</span>
                        </div>
                        <div className="h-2 bg-muted rounded">
                          <div
                            className="h-full bg-primary rounded"
                            style={{
                              width: `${(metric.storage / 1000) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemDesignPage;
