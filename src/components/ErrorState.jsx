import { Button } from "./Button";

export const ErrorState = ({ message, onRetry }) => (
  <div className="surface-muted p-8 text-center">
    <h3 className="text-lg font-semibold text-white">Something needs attention</h3>
    <p className="mt-2 text-sm text-rose-200">{message}</p>
    {onRetry ? (
      <Button className="mt-5" onClick={onRetry}>
        Try again
      </Button>
    ) : null}
  </div>
);
