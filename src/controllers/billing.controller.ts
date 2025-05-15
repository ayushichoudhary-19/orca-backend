import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

export const addCard = async (req: Request, res: Response) => {
  const { email, name, paymentMethodId } = req.body;
  try {
    const customer = await stripe.customers.create({ email, name });
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    res.status(200).json({ success: true, customerId: customer.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getBillingHistory = async (req: Request, res: Response) => {
  const { customerId } = req.query;
  try {
    const invoices = await stripe.invoices.list({ customer: customerId as string });
    res.status(200).json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};