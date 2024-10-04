import stripe from '../config/stripeConfig.js';
const BillingController  = {
// Create a Stripe Customer
async createCustomer(req, res) {
  try {
    const { token, name, paymentMethodId, amount, currency, desc } = req.body;
    const customer = await stripe.customers.create({
      email: token.email,
      name,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const charge = await stripe.charges.create({
      amount,
      currency,
      customer: customer.id,
      description: desc,
      receipt_email: token.email,
    });

    res.status(200).json({ customer, charge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},

// controllers/billingController.js
async createInvoice (req, res) {
    try {
      const { customerId, amt, desc } = req.body;
  
      // Create an invoice
      const invoiceItem = await stripe.invoiceItems.create({
        customer: customerId,
        amount: amt, // Amount in cents ($10.00)
        currency: 'usd',
        description: desc,
      });
  
      const invoice = await stripe.invoices.create({
        customer: customerId,
        auto_advance: true, // Automatically finalize the invoice
      });
  
      res.status(200).json({ invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
}
export default BillingController;