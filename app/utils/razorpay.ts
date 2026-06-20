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
  private static razorpayInstance: any;

  static async initialize(key: string): Promise<void> {
    await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    this.razorpayInstance = new (window as any).Razorpay({
      key: key
    });
  }

  static async createPayment(options: PaymentOptions): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const paymentObject = {
        ...options,
        handler: (response: any) => {
          resolve({ success: true, data: response });
        },
        modal: {
          ondismiss: () => {
            resolve({ success: false, error: 'Payment cancelled by user' });
          }
        }
      };

      this.razorpayInstance.open(paymentObject);
    });
  }
}

// Example usage in your component:
export const initializePayment = async (
  videoId: string,
  amount: number,
  userId: string,
  userEmail: string
) => {
  try {
    // 1. First, create an order on your backend
    const order = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, videoId })
    }).then(res => res.json());

    // 2. Initialize Razorpay if not already initialized
    await RazorpayService.initialize(process.env.NEXT_PUBLIC_RAZORPAY_KEY!);

    // 3. Create payment
    const payment = await RazorpayService.createPayment({
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
    });

    if (payment.success) {
      // 4. Verify payment on backend
      await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: payment.data.razorpay_payment_id,
          orderId: order.id,
          signature: payment.data.razorpay_signature,
          videoId
        })
      });

      return { success: true };
    }

    return { success: false, error: payment.error };
  } catch (error) {
    console.error('Payment failed:', error);
    return { success: false, error: 'Payment failed' };
  }
};