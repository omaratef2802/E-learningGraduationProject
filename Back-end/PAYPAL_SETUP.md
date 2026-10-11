# PayPal Checkout Setup (PathwayEd)

This project uses PayPal Orders v2. The backend creates the PayPal order, captures it after the buyer approves, verifies the completed amount/currency/order reference, then fulfills the existing Order by creating an Enrollment, crediting the instructor wallet, and removing only the purchased courses from the cart.

## 1. Protect and rotate credentials first

A previous project archive and chat message included secrets. Treat them as compromised. Regenerate the PayPal Sandbox app secret and rotate the other exposed credentials (MongoDB database password, mail app password, Google OAuth client secret, and Cloudinary API secret) before using this integration. Do not commit or send `.env`.

## 2. Configure the backend

1. In the Back-end folder, copy `.env.example` to `.env`.
2. Restore your environment settings using the newly rotated credentials.
3. In PayPal Developer Dashboard, open **Apps & Credentials → Sandbox**, create/open a REST app, and put its Sandbox Client ID and Secret in `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`.
4. Set `PAYPAL_MODE=sandbox`, `PRICE_CURRENCY=EGP`, and `PAYPAL_CURRENCY=USD` for the initial test. The old Paymob path and core course-detail UI show stored course prices in EGP. PayPal's current list of transaction currencies does not include EGP, so this integration keeps the order/wallet amount in EGP and converts the gateway amount to USD. In Sandbox only, if `PAYPAL_EGP_PER_USD` is blank, the API uses a clearly flagged test estimate of 50 EGP per USD. This is not a live exchange quote. Before any Live payment, set `PAYPAL_EGP_PER_USD` to a verified current rate; Live mode refuses to start checkout if the rate is missing.
5. Start the backend using the project's normal command: `npm start`.

Never put `PAYPAL_CLIENT_SECRET` in Angular or in any frontend environment file. The Client ID is public and is read from the authenticated backend config endpoint.

## 3. Test a successful purchase

1. In PayPal Developer Dashboard → **Sandbox Accounts**, create/use a Sandbox Business account and a Sandbox Personal account.
2. Run Angular locally and sign in as a student.
3. Add a published, paid course to the cart or click **Buy now** on a course detail page.
4. On `/payment`, approve the PayPal Sandbox checkout using the Sandbox buyer account. If PayPal offers **Debit or Credit Card** for the account/region, that can be used to test card funding as well.
5. Confirm the payment result screen reports success and the student can see the course in My Courses. Confirm a Payment (`paymentMethod: paypal`, `status: success`) stores the original order amount in `amount`/`currency` and the converted amount in `gatewayAmount`/`gatewayCurrency`, plus a paid Order, Enrollment, and instructor Wallet entry in MongoDB.
6. Also test canceling checkout and verify that the course is not unlocked. A browser redirect or client-only success message is never used as proof of payment.

## API endpoints

- `GET /E-learning/payments/paypal/config` — returns the public Client ID and transaction currency for the JavaScript SDK.
- `POST /E-learning/payments/paypal/create-order` with `{ "orderId": "..." }` — creates/reuses a pending local Payment and creates the PayPal order on the backend.
- `POST /E-learning/payments/paypal/capture-order` with `{ "paypalOrderId": "..." }` — captures/validates the PayPal transaction and fulfills the local order.
- `GET /E-learning/payments/:paymentId/status` — returns the authenticated user's payment status.

The protected API expects the JWT directly in the `Authorization` header, without a `Bearer ` prefix, matching the existing backend middleware.

## Card payments and Live mode

The checkout JavaScript SDK requests `enable-funding=card`, which lets PayPal display its debit/credit-card funding option when eligible. PayPal decides which payment methods are available based on merchant account approval, buyer location, and other eligibility rules; the application cannot force a card button to be available. Verify the card option in Sandbox first.

Do not switch `PAYPAL_MODE=live` until the merchant account is approved and you have copied the **Live** credentials from PayPal Developer Dashboard. Keep the same server-side validation and test the Live configuration with a low-value transaction before public launch. Do not reuse Sandbox credentials in Live mode.

## Official references

- PayPal Checkout integration: https://developer.paypal.com/platforms/checkout/standard/integrate
- JavaScript SDK funding options: https://developer.paypal.com/sdk/js/v5/configuration
- Supported transaction currencies: https://developer.paypal.com/api/codes/currency/
