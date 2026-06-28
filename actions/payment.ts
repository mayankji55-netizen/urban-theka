"use server";

import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(amount: number) {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `UT-${Date.now()}`,
    });

    return {
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    };
  } catch (e) {
    console.error(e);

    return {
      success: false,
      error: "Unable to create payment.",
    };
  }
}