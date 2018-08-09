// Get the value of a single parameter or undefined if not found
export const getParameter = (
  parameters: AWS.SSM.Parameter[],
  name: string,
): string | undefined => {
  const val = parameters.find(
    p => p.Name !== undefined && p.Name.endsWith(`/${name}`),
  );
  if (val && val.Value) {
    return val.Value;
  }
  return undefined;
};
