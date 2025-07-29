"use client";

import { differenceInMinutes } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { fetcher } from "@/lib/utils";

import { CheckCircle, InfoIcon } from "../custom/icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function AuthorizePayment({
  intent = { reservationId: "sample-uuid" },
}: {
  intent?: { reservationId: string };
}) {
  const { data: reservation, mutate } = useSWR(
    `/api/reservation?id=${intent.reservationId}`,
    fetcher,
  );

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const handleAuthorize = async () => {
    try {
      const response = await fetch(
        `/api/reservation?id=${intent.reservationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cardNumber,
            expiry,
            cvv,
            name,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const updatedReservation = await response.json();
      mutate(updatedReservation);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  return reservation?.hasCompletedPayment ? (
    <div className="bg-emerald-500 p-4 rounded-lg gap-4 flex flex-row justify-between items-center">
      <div className="dark:text-emerald-950 text-emerald-50 font-medium">
        Payment Verified
      </div>
      <div className="dark:text-emerald-950 text-emerald-50">
        <CheckCircle size={20} />
      </div>
    </div>
  ) : differenceInMinutes(new Date(), new Date(reservation?.createdAt)) >
    150 ? (
    <div className="bg-red-500 p-4 rounded-lg gap-4 flex flex-row justify-between items-center">
      <div className="text-background">Payment Gateway Timed Out</div>
      <div className="text-background">
        <InfoIcon size={20} />
      </div>
    </div>
  ) : (
    <div className="bg-muted p-4 rounded-lg flex flex-col gap-2">
      <div className="text font-medium">Enter your card details to authorize payment</div>
      <div className="flex flex-col gap-2 mt-2">
        <Input
          type="text"
          placeholder="Cardholder Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="dark:bg-zinc-700 text-base border-none"
        />
        <Input
          type="text"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          className="dark:bg-zinc-700 text-base border-none"
        />
        <div className="flex flex-row gap-2">
          <Input
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="dark:bg-zinc-700 text-base border-none w-1/2"
          />
          <Input
            type="text"
            placeholder="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            className="dark:bg-zinc-700 text-base border-none w-1/2"
          />
        </div>
        <Button className="mt-2" onClick={handleAuthorize}>
          Authorize Payment
        </Button>
      </div>
    </div>
  );
}
