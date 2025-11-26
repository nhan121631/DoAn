import { Suspense } from "react";
import PaymentPaypalResultClient from "../components/payment/PaymentPaypalResultClient";

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPaypalResultClient />
    </Suspense>
  );
}
