import { useIsFetching, useIsMutating } from "@tanstack/react-query";

// One indicator, mounted once, that reacts to any query/mutation anywhere in the
// app — so every page gets the same "something is happening" signal without each
// page having to wire up its own loading bar.
const GlobalLoadingBar = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  if (isFetching === 0 && isMutating === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.5 bg-primary/10 z-[100] overflow-hidden"
      data-cy="global-loading-bar"
    >
      <div className="h-full w-1/3 bg-primary rounded-full animate-indeterminate-bar" />
    </div>
  );
};

export default GlobalLoadingBar;
