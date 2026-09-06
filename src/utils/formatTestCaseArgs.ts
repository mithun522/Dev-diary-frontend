// Labels each positional test case argument with its parameter name, e.g.
// ["arr", "target"] + [[2,7,11,15], 9] -> "arr = [2,7,11,15], target = 9".
// Works for any value shape (arrays, objects, primitives) since graphs/trees are just nested
// arrays/objects under the hood - only the label changes per problem.
export const formatTestCaseArgs = (paramNames: string[] | undefined, args: unknown[]): string =>
  args
    .map((value, index) => {
      const name = paramNames?.[index];
      const formatted = JSON.stringify(value);
      return name ? `${name} = ${formatted}` : formatted;
    })
    .join(", ");
