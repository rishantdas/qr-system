import { CheckCircle2, Home, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { menuService } from "../services/menuService";
import { normalizeExternalUrl } from "../utils/url";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const { state } = useLocation();
  const orderReference = state?.restaurantOrderCode ?? orderId?.slice(0, 8);
  const [reviewDetails, setReviewDetails] = useState({
    restaurantName: state?.restaurantName ?? "",
    googleReviewUrl: state?.googleReviewUrl ?? "",
  });

  useEffect(() => {
    let mounted = true;

    const loadReviewDetails = async () => {
      if (!state?.tableId || reviewDetails.googleReviewUrl) {
        return;
      }

      try {
        const table = await menuService.getTable(state.tableId);

        if (!mounted) {
          return;
        }

        setReviewDetails({
          restaurantName: table.restaurants?.name ?? "",
          googleReviewUrl: table.restaurants?.google_review_url ?? "",
        });
      } catch {
        // The success page still works without review details.
      }
    };

    loadReviewDetails();

    return () => {
      mounted = false;
    };
  }, [reviewDetails.googleReviewUrl, state?.tableId]);

  const handleLeaveReview = () => {
    const reviewUrl = normalizeExternalUrl(reviewDetails.googleReviewUrl ?? "");

    if (!reviewUrl) {
      return;
    }

    window.open(reviewUrl, "_blank", "noopener,noreferrer");
  };

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
          Order <span className="font-semibold text-white">#{orderReference}</span>{" "}
          has been sent successfully for Table{" "}
          <span className="font-semibold text-white">
            {state?.tableNumber ?? "your table"}
          </span>
          . The restaurant team will start preparing it shortly.
        </p>
        {reviewDetails.googleReviewUrl ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Share your experience
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Enjoyed your meal at{" "}
              <span className="font-semibold text-white">
                {reviewDetails.restaurantName || "the restaurant"}
              </span>
              ? A quick Google review helps more guests discover the place.
            </p>
            <Button className="mt-4 w-full sm:w-auto" onClick={handleLeaveReview}>
              <Star className="mr-2 h-4 w-4" />
              Leave a Google review
            </Button>
          </div>
        ) : null}
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
