import PaymentResultClient from "@/app/landlord/components/payment/PaymentResultClient";
import { Suspense } from "react";

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentResultClient />
    </Suspense>
  );
}
