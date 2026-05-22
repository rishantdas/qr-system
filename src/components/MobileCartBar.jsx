import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "../utils/currency";

export const MobileCartBar = ({ totalItems, totalAmount, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-[1.35rem] bg-[#ff9f1f] px-5 py-4 text-left text-[#0d1524] shadow-[0_20px_40px_rgba(0,0,0,0.28)] md:hidden"
  >
    <div className="flex items-center gap-3">
      <ShoppingCart className="h-5 w-5" />
      <div>
        <p className="text-lg font-black">{totalItems} items in cart</p>
        <p className="text-xs font-semibold text-[#51330f]">
          Tap to review your order
        </p>
      </div>
    </div>
    <span className="text-lg font-black">
      {formatCurrency(totalAmount)}
    </span>
  </button>
);
