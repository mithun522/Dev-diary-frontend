jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchCatalogCategories,
  fetchCatalogStack,
  fetchCatalogQuestion,
  searchCatalogQuestions,
} from "../../../src/api/services/techInterviewCatalog.service";
import {
  TECH_INTERVIEW_CATALOG_CATEGORIES,
  TECH_INTERVIEW_CATALOG_STACK_BY_ID,
  TECH_INTERVIEW_CATALOG_QUESTION_BY_SLUG,
  TECH_INTERVIEW_CATALOG_SEARCH,
} from "../../../src/constants/Api";
import type {
  CatalogCategory,
  CatalogStackTree,
  CatalogQuestion,
  CatalogSearchPage,
} from "../../../src/data/techInterviewCatalogData";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchCatalogCategories (tier 1: category)", () => {
  test("requests the bare /catalog/categories collection", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchCatalogCategories();
    expect(mockedAxios.get).toHaveBeenCalledWith(TECH_INTERVIEW_CATALOG_CATEGORIES);
  });

  test("returns the categories array unchanged", async () => {
    const categories: CatalogCategory[] = [
      {
        slug: "cloud",
        label: "Cloud",
        stacks: [{ stack: "aws", label: "AWS", topicCount: 3, questionCount: 10 }],
      },
    ];
    mockedAxios.get.mockResolvedValue({ data: categories });
    await expect(fetchCatalogCategories()).resolves.toBe(categories);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(fetchCatalogCategories()).rejects.toThrow("Network Error");
  });
});

describe("fetchCatalogStack (tier 2: stack)", () => {
  test("requests /catalog/stacks/{stack}", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchCatalogStack("aws");
    expect(mockedAxios.get).toHaveBeenCalledWith(TECH_INTERVIEW_CATALOG_STACK_BY_ID("aws"));
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("/catalog/stacks/aws")
    );
  });

  test("BUG: does not URL-encode the stack segment — it is raw template interpolation", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchCatalogStack("node & express");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      TECH_INTERVIEW_CATALOG_STACK_BY_ID("node & express")
    );
  });

  test("returns the stack tree unchanged", async () => {
    const tree: CatalogStackTree = {
      stack: "aws",
      label: "AWS",
      category: "cloud",
      categoryLabel: "Cloud",
      topics: [
        {
          slug: "lambda",
          title: "Lambda",
          description: "Serverless compute",
          questions: [
            { slug: "cold-start", question: "What causes a cold start?", difficulty: "BEGINNER" },
          ],
        },
      ],
    };
    mockedAxios.get.mockResolvedValue({ data: tree });
    await expect(fetchCatalogStack("aws")).resolves.toBe(tree);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Not Found"));
    await expect(fetchCatalogStack("missing")).rejects.toThrow("Not Found");
  });
});

describe("fetchCatalogQuestion (tier 4: question, by slug)", () => {
  test("requests /catalog/questions/{slug}", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchCatalogQuestion("cold-start-causes");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      TECH_INTERVIEW_CATALOG_QUESTION_BY_SLUG("cold-start-causes")
    );
  });

  test("BUG: does not URL-encode the slug segment — it is raw template interpolation", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} });
    await fetchCatalogQuestion("what is a & b?");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      TECH_INTERVIEW_CATALOG_QUESTION_BY_SLUG("what is a & b?")
    );
  });

  test("returns the question detail unchanged", async () => {
    const question: CatalogQuestion = {
      slug: "cold-start-causes",
      question: "What causes a cold start?",
      difficulty: "INTERMEDIATE",
      category: "cloud",
      categoryLabel: "Cloud",
      stack: "aws",
      stackLabel: "AWS",
      topic: "lambda",
      topicTitle: "Lambda",
      answer: "A cold start happens when...",
      notes: null,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    };
    mockedAxios.get.mockResolvedValue({ data: question });
    await expect(fetchCatalogQuestion("cold-start-causes")).resolves.toBe(question);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Not Found"));
    await expect(fetchCatalogQuestion("missing")).rejects.toThrow("Not Found");
  });
});

describe("searchCatalogQuestions (cross-tier search)", () => {
  test("always includes q, even when the other filters are absent", async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [], totalLength: 0, page: 1, pageSize: 20 } });
    await searchCatalogQuestions({ q: "cold start" });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECH_INTERVIEW_CATALOG_SEARCH}?q=cold+start`
    );
  });

  test("includes category when given", async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [], totalLength: 0, page: 1, pageSize: 20 } });
    await searchCatalogQuestions({ q: "lambda", category: "cloud" });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECH_INTERVIEW_CATALOG_SEARCH}?q=lambda&category=cloud`
    );
  });

  test("includes stack when given", async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [], totalLength: 0, page: 1, pageSize: 20 } });
    await searchCatalogQuestions({ q: "lambda", stack: "aws" });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECH_INTERVIEW_CATALOG_SEARCH}?q=lambda&stack=aws`
    );
  });

  test("includes difficulty when given", async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [], totalLength: 0, page: 1, pageSize: 20 } });
    await searchCatalogQuestions({ q: "lambda", difficulty: "ADVANCED" });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECH_INTERVIEW_CATALOG_SEARCH}?q=lambda&difficulty=ADVANCED`
    );
  });

  test("omits category/stack/difficulty when they are empty strings (falsy)", async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [], totalLength: 0, page: 1, pageSize: 20 } });
    await searchCatalogQuestions({ q: "lambda", category: "", stack: "" });
    expect(mockedAxios.get).toHaveBeenCalledWith(`${TECH_INTERVIEW_CATALOG_SEARCH}?q=lambda`);
  });

  test("combines every filter in category, stack, difficulty, page order after q", async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [], totalLength: 0, page: 2, pageSize: 20 } });
    await searchCatalogQuestions({
      q: "lambda",
      category: "cloud",
      stack: "aws",
      difficulty: "EXPERT",
      page: 2,
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECH_INTERVIEW_CATALOG_SEARCH}?q=lambda&category=cloud&stack=aws&difficulty=EXPERT&page=2`
    );
  });

  test("omits page when it is 1 (the implicit default), even though it is truthy", async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [], totalLength: 0, page: 1, pageSize: 20 } });
    await searchCatalogQuestions({ q: "lambda", page: 1 });
    expect(mockedAxios.get).toHaveBeenCalledWith(`${TECH_INTERVIEW_CATALOG_SEARCH}?q=lambda`);
  });

  test("omits page when it is 0 (falsy)", async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [], totalLength: 0, page: 1, pageSize: 20 } });
    await searchCatalogQuestions({ q: "lambda", page: 0 });
    expect(mockedAxios.get).toHaveBeenCalledWith(`${TECH_INTERVIEW_CATALOG_SEARCH}?q=lambda`);
  });

  test("includes page when it is greater than 1", async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [], totalLength: 0, page: 3, pageSize: 20 } });
    await searchCatalogQuestions({ q: "lambda", page: 3 });
    expect(mockedAxios.get).toHaveBeenCalledWith(`${TECH_INTERVIEW_CATALOG_SEARCH}?q=lambda&page=3`);
  });

  test("URL-encodes special characters in q via URLSearchParams", async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [], totalLength: 0, page: 1, pageSize: 20 } });
    await searchCatalogQuestions({ q: "a&b=c d" });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${TECH_INTERVIEW_CATALOG_SEARCH}?q=a%26b%3Dc+d`
    );
  });

  test("returns the search page unchanged", async () => {
    const page: CatalogSearchPage = {
      results: [
        { slug: "cold-start", question: "What causes a cold start?", difficulty: "BEGINNER", category: "cloud", stack: "aws", topic: "lambda" },
      ],
      totalLength: 1,
      page: 1,
      pageSize: 20,
    };
    mockedAxios.get.mockResolvedValue({ data: page });
    await expect(searchCatalogQuestions({ q: "cold start" })).resolves.toBe(page);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(searchCatalogQuestions({ q: "lambda" })).rejects.toThrow("Network Error");
  });
});
