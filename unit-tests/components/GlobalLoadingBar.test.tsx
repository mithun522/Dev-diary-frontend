// GlobalLoadingBar's whole job is to translate the two react-query activity counters into a
// visible/hidden bar; mocking the hooks directly (rather than wiring a real QueryClient and
// racing real fetches) lets each case pin an exact, deterministic counter combination.
jest.mock("@tanstack/react-query", () => ({
  useIsFetching: jest.fn(),
  useIsMutating: jest.fn(),
}));

import { render } from "@testing-library/react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import GlobalLoadingBar from "../../src/components/GlobalLoadingBar";

// The component identifies its bar with data-cy (this codebase's convention), not data-testid.
const getBars = () =>
  document.querySelectorAll('[data-cy="global-loading-bar"]');

const mockedUseIsFetching = useIsFetching as jest.MockedFunction<
  typeof useIsFetching
>;
const mockedUseIsMutating = useIsMutating as jest.MockedFunction<
  typeof useIsMutating
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GlobalLoadingBar", () => {
  test("renders nothing when nothing is fetching or mutating", () => {
    mockedUseIsFetching.mockReturnValue(0);
    mockedUseIsMutating.mockReturnValue(0);

    const { container } = render(<GlobalLoadingBar />);

    expect(getBars()).toHaveLength(0);
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the bar while a query is fetching", () => {
    mockedUseIsFetching.mockReturnValue(1);
    mockedUseIsMutating.mockReturnValue(0);

    render(<GlobalLoadingBar />);

    expect(getBars()).toHaveLength(1);
  });

  test("shows the bar while a mutation is in flight, even with no fetches", () => {
    mockedUseIsFetching.mockReturnValue(0);
    mockedUseIsMutating.mockReturnValue(1);

    render(<GlobalLoadingBar />);

    expect(getBars()).toHaveLength(1);
  });

  test("shows exactly one bar when both fetching and mutating are active", () => {
    mockedUseIsFetching.mockReturnValue(2);
    mockedUseIsMutating.mockReturnValue(3);

    render(<GlobalLoadingBar />);

    expect(getBars()).toHaveLength(1);
  });
});
