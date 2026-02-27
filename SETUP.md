# AO Web Solutions — Setup Guide

## Email Form Integration (EmailJS)

To make the contact form send emails to **aowebsolutionsofficial@gmail.com**, follow these steps:

### Step 1: Create a Free EmailJS Account
1. Go to https://www.emailjs.com and sign up for free
2. Free tier includes 200 emails/month — plenty for a contact form

### Step 2: Connect Gmail
1. In your EmailJS dashboard, go to **Email Services** → **Add New Service**
2. Choose **Gmail**
3. Connect your `aowebsolutionsofficial@gmail.com` account
4. Note the **Service ID** (e.g., `service_xxxxxxx`)

### Step 3: Create an Email Template
1. Go to **Email Templates** → **Create New Template**
2. Set "To Email" to: `aowebsolutionsofficial@gmail.com`
3. Set "Subject" to: `New Inquiry from {{from_name}}`
4. Set "Body" to:
```
New project inquiry received!

Name: {{from_name}}
Email: {{from_email}}
Business: {{business}}
Package Interest: {{package}}

Message:
{{message}}
```
5. Save and note the **Template ID** (e.g., `template_xxxxxxx`)

### Step 4: Get Your Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key**

### Step 5: Update the Code
Open `js/main.js` and update these three lines near the top:

```javascript
const EMAILJS_SERVICE_ID  = 'service_xxxxxxx';   // ← your service ID
const EMAILJS_TEMPLATE_ID = 'template_xxxxxxx';  // ← your template ID
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';    // ← your public key
```

---

## Fallback Behavior
If EmailJS is not configured, the contact form will open the user's mail client (`mailto:`) pre-filled with their message. This is a reliable fallback that always works.

---

## File Structure
```
ao-web/
├── index.html          ← Main website
├── css/
│   ├── main.css        ← Main styles
│   └── checkout.css    ← Cart page styles
├── js/
│   ├── main.js         ← Main JS + form handling
│   └── cart.js         ← Cart + PayPal redirect
└── pages/
    ├── cart.html        ← Cart page
    └── confirmation.html ← Order confirmation
```

## PayPal Links
The PayPal payment links are in `js/cart.js`. Update them if your PayPal links change:
```javascript
const PAYPAL_LINKS = {
  beginner:     'https://www.paypal.com/ncp/payment/...',
  intermediate: 'https://www.paypal.com/ncp/payment/...',
  premium:      'https://www.paypal.com/ncp/payment/...',
};
```
