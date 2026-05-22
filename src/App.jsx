import { ErrorBoundary } from "./components/ErrorBoundary";
import { ConfigNotice } from "./components/ConfigNotice";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <ErrorBoundary>
      <ConfigNotice />
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
