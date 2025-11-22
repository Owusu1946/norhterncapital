# Paystack Payment Integration Setup

This guide will help you set up Paystack payment processing for Northern Capital Hotel.

## Prerequisites

1. A Paystack account (sign up at https://paystack.com)
2. Your Paystack API keys (test and live)

## Setup Steps

### 1. Get Your Paystack API Keys

1. Log in to your Paystack Dashboard: https://dashboard.paystack.com
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** and **Secret Key**
   - Use **Test Keys** for development
   - Use **Live Keys** for production

### 2. Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual Paystack keys:

```env
PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key
PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Never commit your `.env.local` file to version control!

### 3. Set Up Webhook URL

1. Go to **Settings** → **API Keys & Webhooks** in your Paystack Dashboard
2. Add your webhook URL:
   - **Development:** `http://your-ngrok-url.ngrok.io/api/paystack/webhook`
   - **Production:** `https://yourdomain.com/api/paystack/webhook`
3. Copy your webhook secret and add it to `.env.local`:

```env
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Testing Webhooks Locally

To test webhooks on your local machine, use ngrok:

1. Install ngrok: https://ngrok.com/download
2. Run your Next.js app: `npm run dev`
3. In a new terminal, run: `ngrok http 3000`
4. Copy the HTTPS URL from ngrok
5. Update your Paystack webhook URL with the ngrok URL

### 5. Test Payment Flow

Use these Paystack test cards:

**Successful Transaction:**
- Card Number: `4084084084084081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

**Failed Transaction:**
- Card Number: `5060666666666666666`
- CVV: Any 3 digits
- Expiry: Any future date

## Payment Flow

1. **Initialize Transaction** (`/api/paystack/initialize`)
   - Customer clicks "Pay Now"
   - Backend initializes transaction with Paystack
   - Returns `access_code` to frontend

2. **Complete Payment** (Paystack Popup)
   - Frontend opens Paystack payment modal
   - Customer enters payment details
   - Paystack processes payment

3. **Verify Transaction** (`/api/paystack/verify`)
   - After payment, verify transaction status
   - Check payment amount matches booking total
   - Update booking status

4. **Webhook Notification** (`/api/paystack/webhook`)
   - Paystack sends webhook on payment success/failure
   - Server validates webhook signature
   - Updates booking status in database

## Currency

The integration uses **GHS (Ghana Cedis)** as the default currency. Amounts are automatically converted to pesewas (smallest unit) before sending to Paystack.

Example:
- ₵350.00 → 35000 pesewas

## Security Best Practices

1. ✅ Never expose your secret key in frontend code
2. ✅ Always verify webhook signatures
3. ✅ Verify transaction amounts match your records
4. ✅ Use HTTPS in production
5. ✅ Validate all user inputs
6. ✅ Store sensitive data securely

## Going Live

Before going live:

1. Replace test keys with live keys in `.env.local`
2. Update webhook URL to production domain
3. Test the complete payment flow
4. Set up proper error logging and monitoring
5. Configure email notifications for successful bookings

## Support

- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Northern Capital Hotel Support: info@northerncapitalhotel.com

## Troubleshooting

### Payment not completing
- Check browser console for errors
- Verify API keys are correct
- Ensure `.env.local` is loaded (restart dev server)

### Webhook not receiving events
- Verify webhook URL is accessible
- Check webhook signature validation
- Review Paystack dashboard webhook logs

### Amount mismatch errors
- Ensure amounts are in pesewas (multiply by 100)
- Verify currency is set to GHS
- Check for rounding errors in calculations
