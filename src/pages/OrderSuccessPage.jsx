import { CheckCircle2, Home } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "../components/Button";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const { state } = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface-panel max-w-xl p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
          Order received
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-white">
          Your order is in the kitchen.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Order <span className="font-semibold text-white">#{orderId?.slice(0, 8)}</span>{" "}
          has been sent successfully for Table{" "}
          <span className="font-semibold text-white">
            {state?.tableNumber ?? "your table"}
          </span>
          . The restaurant team will start preparing it shortly.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to={state?.tableId ? `/menu/${state.tableId}` : "/"}>
            <Button className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Back to menu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
