import { Link, useSearchParams } from "react-router-dom";
import StoreNavbar from "../../components/store/StoreNavbar";
import { formatINR } from "../../lib/types";
import { CheckCircleIcon } from "../../components/icons";

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order") ?? "";
  const paymentId = params.get("payment") ?? "";
  const amount = Number(params.get("amount") ?? 0);

  return (
    <>
      <StoreNavbar />
      <main className="store-page">
        <div className="container">
          <div className="store-state success-state">
            <span className="success-ico">
              <CheckCircleIcon />
            </span>
            <h2>Order placed successfully</h2>
            <p>Your payment was verified. Thanks for shopping with CommerceX!</p>

            <div className="success-card">
              <div className="summary-row">
                <span>Order</span>
                <span className="mono">{orderId || "—"}</span>
              </div>
              <div className="summary-row">
                <span>Payment</span>
                <span className="mono">{paymentId || "—"}</span>
              </div>
              <div className="summary-row total">
                <span>Amount paid</span>
                <span>{formatINR(amount)}</span>
              </div>
            </div>

            <div className="success-actions">
              <Link to="/dashboard" className="btn btn-primary">
                View my orders
              </Link>
              <Link to="/shop" className="btn btn-outline">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
