export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "The upload stopped before it could finish.";
}
