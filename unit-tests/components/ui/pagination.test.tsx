import { fireEvent, render, screen } from "@testing-library/react";
import Pagination, { buildPageList } from "../../../src/components/ui/pagination";

describe("buildPageList", () => {
  test("returns every page when totalPages is small enough to show them all", () => {
    expect(buildPageList(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test("returns a single page for totalPages: 1", () => {
    expect(buildPageList(1, 1)).toEqual([1]);
  });

  test("shows a right ellipsis when the current page is near the start, padded to 5 leading numbers", () => {
    expect(buildPageList(1, 40)).toEqual([1, 2, 3, 4, 5, "ellipsis", 40]);
  });

  test("shows a left ellipsis when the current page is near the end, padded to 5 trailing numbers", () => {
    expect(buildPageList(40, 40)).toEqual([1, "ellipsis", 36, 37, 38, 39, 40]);
  });

  test("shows both ellipses when the current page is in the middle", () => {
    expect(buildPageList(20, 40)).toEqual([1, "ellipsis", 19, 20, 21, "ellipsis", 40]);
  });

  test("always includes page 1 and the last page", () => {
    const pages = buildPageList(20, 40);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(40);
  });
});

describe("Pagination component", () => {
  test("renders nothing when totalPages <= 1", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("renders nothing when totalPages is 0", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("marks the current page with aria-current='page'", () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Go to page 3" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("button", { name: "Go to page 1" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  test("clicking a page number invokes onPageChange with that page number", () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Go to page 4" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  test("Previous is disabled on page 1", () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  test("Next is disabled on the last page", () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  test("neither Prev nor Next is disabled on a middle page", () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous page" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).not.toBeDisabled();
  });

  test("clicking Previous/Next calls onPageChange with current page -1 / +1", () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  test("renders an ellipsis marker (not a clickable page) for a large page count", () => {
    render(<Pagination currentPage={1} totalPages={40} onPageChange={() => {}} />);
    expect(screen.getByText("…")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Go to page 20" })).not.toBeInTheDocument();
  });
});
