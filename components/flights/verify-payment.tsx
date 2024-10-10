export function VerifyPayment({
  result: { hasCompletedPayment },
}: {
  result: {
    hasCompletedPayment: boolean;
  };
}) {
  return (
    <div>
      {hasCompletedPayment
        ? "Your payment transaction has been verified!"
        : "Unable to verify your payment, please try again!"}
    </div>
  );
}
