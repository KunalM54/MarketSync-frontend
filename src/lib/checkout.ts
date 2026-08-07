import { apiRequest } from "./api";
import type { CheckoutResponse, Order } from "./types";

let scriptPromise: Promise<void> | null = null;

const loadRazorpayScript = (): Promise<void> => {
  if (typeof (window as any).Razorpay !== "undefined") {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Failed to load Razorpay checkout"));
      };
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
};

export interface RazorpaySuccess {
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/**
 * Opens the Razorpay payment modal for an order that was already
 * created on the backend. Resolves with the payment details on success.
 */
const openRazorpayModal = (
  keyId: string,
  orderId: string,
  amountPaise: number,
  prefill: { name: string; email: string; contact?: string },
): Promise<RazorpaySuccess> => {
  return new Promise((resolve, reject) => {
    const RazorpayCtor = (window as any).Razorpay;

    if (!RazorpayCtor) {
      reject(new Error("Razorpay is not available"));
      return;
    }

    const options = {
      key: keyId,
      amount: amountPaise,
      currency: "INR",
      name: "CommerceX",
      description: "Order payment",
      order_id: orderId,
      prefill: {
        name: prefill.name,
        email: prefill.email,
        contact: prefill.contact ?? "",
      },
      theme: { color: "#4f46e5" },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
      handler: (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
        resolve({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
    };

    const razorpay = new RazorpayCtor(options);
    razorpay.on("payment.failed", (error: unknown) => {
      reject(error instanceof Error ? error : new Error("Payment failed"));
    });
    razorpay.open();
  });
};

/**
 * Runs the full checkout flow for a backend-created order:
 * 1. Open the Razorpay modal
 * 2. Verify the payment signature with the backend
 * 3. Return the paid order
 */
export const payForOrder = async (
  checkout: CheckoutResponse,
  prefill: { name: string; email: string; contact?: string },
): Promise<Order> => {
  await loadRazorpayScript();

  const { razorpayPaymentId, razorpaySignature } = await openRazorpayModal(
    checkout.keyId,
    checkout.razorpayOrder.id,
    checkout.razorpayOrder.amount,
    prefill,
  );

  const verified = await apiRequest<{ order: Order }>("/payment/verify", {
    method: "POST",
    body: JSON.stringify({
      razorpayOrderId: checkout.razorpayOrder.id,
      razorpayPaymentId,
      razorpaySignature,
    }),
  });

  return verified.order;
};
