// config/stripe.js
import Stripe from 'stripe';

// Replace with your Stripe secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;
