// utils/razorpay.ts
import { loadScript } from './scriptLoader';

interface PaymentOptions {
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  userId: string;
  userEmail: string;
  theme: {
    color: string;
  };
}

export class RazorpayService {
  static async createPayment(key: string, options: PaymentOptions): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    return new Promise((resolve) => {
      const paymentObject = {
        key: key,
        amount: options.amount,
        currency: options.currency,
        order_id: options.orderId,
        name: options.name,
        description: options.description,
        prefill: {
          email: options.userEmail
        },
        theme: options.theme,
        handler: (response: any) => {
          resolve({ success: true, data: response });
        },
        modal: {
          ondismiss: () => {
            resolve({ success: false, error: 'Payment cancelled by user' });
          }
        }
      };

      const rzp = new (window as any).Razorpay(paymentObject);
      rzp.open();
    });
  }
}

export const initializePayment = async (
  videoId: string,
  amount: number,
  userId: string,
  userEmail: string
) => {
  try {
    // 1. Create order on backend
    const resOrder = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, videoId })
    });

    if (!resOrder.ok) {
      const errorData = await resOrder.json().catch(() => ({}));
      return { success: false, error: errorData.message || 'Failed to create order' };
    }

    const order = await resOrder.json();

    // 2. Open Razorpay widget and create payment
    const payment = await RazorpayService.createPayment(
      process.env.NEXT_PUBLIC_RAZORPAY_KEY || '',
      {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        orderId: order.id,
        name: 'Stream Priority Request',
        description: 'Priority queue request payment',
        userId,
        userEmail,
        theme: {
          color: '#facc15' // Yellow-400
        }
      }
    );

    if (payment.success) {
      // 3. Verify payment on backend
      const resVerify = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.data.razorpay_payment_id,
          orderId: order.id,
          signature: payment.data.razorpay_signature,
          videoId,
          amount
        })
      });

      if (!resVerify.ok) {
        const errorData = await resVerify.json().catch(() => ({}));
        return { success: false, error: errorData.message || 'Payment verification failed' };
      }

      return { success: true };
    }

    return { success: false, error: payment.error };
  } catch (error: any) {
    console.error('Payment failed:', error);
    return { success: false, error: error.message || 'Payment failed' };
  }
};