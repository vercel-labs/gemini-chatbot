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
        ? "Your payment transaction has been verified for Train!"
        : "Unable to verify your payment for Train, please try again!"}
    </div>
  );
}
