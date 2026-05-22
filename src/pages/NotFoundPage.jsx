import { Link } from "react-router-dom";
import { Button } from "../components/Button";

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <div className="surface-panel max-w-lg p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
        404
      </p>
      <h1 className="mt-3 text-4xl font-extrabold text-white">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-slate-300">
        The page you requested does not exist or the link may be outdated.
      </p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Back to home</Button>
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
