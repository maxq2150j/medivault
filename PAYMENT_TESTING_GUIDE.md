# Payment Gateway Testing Guide

## Quick Start

### 1. Start the Application

**Backend**:
```bash
cd MediVault.Backend
dotnet run
```

**Frontend**:
```bash
cd MediVault.Frontend
npm run dev
```

### 2. Test Scenario: Complete Payment Flow

#### Step 1: Login as Patient
- Go to Login page
- Use patient credentials
- Navigate to Patient Dashboard

#### Step 2: Book an Appointment
- Select Hospital
- Select Doctor
- Choose Date & Time
- Submit appointment request

#### Step 3: Login as Doctor
- Logout from patient
- Login with doctor credentials
- Navigate to Doctor Dashboard
- Go to "Appointments" tab

#### Step 4: Request Payment
- Find the pending appointment from patient
- Click "Approve" button
- Payment modal appears
- Enter amount (e.g., 500 for ₹500)
- Click "Send Payment Request"
- Status should change to "Approved" with payment pending

#### Step 5: Login as Patient Again
- Logout from doctor
- Login as patient again
- Go to "My Appointments" section
- See appointment with:
  - ₹500 payment required
  - "⏳ Pending" status
  - "💳 Pay Now" button

#### Step 6: Make Payment
- Click "Pay Now" button
- Razorpay modal opens
- Use test card: **4111 1111 1111 1111**
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- Click Pay
- Payment should succeed
- Status changes to "✓ Paid"

## Test Cards for Razorpay

### Successful Payments
| Card | Number | Expiry | CVV | Result |
|------|--------|--------|-----|--------|
| Visa | 4111 1111 1111 1111 | Any future | Any 3 digits | Success |
| Mastercard | 5555 5555 5555 4444 | Any future | Any 3 digits | Success |
| Rupay | 6074 0000 0000 0001 | Any future | Any 3 digits | Success |

### Failed Payments
| Card | Number | Expiry | CVV | Result |
|------|--------|--------|-----|--------|
| Visa | 4000 0000 0000 0002 | Any future | Any 3 digits | Declined |
| Visa | 4000 0000 0000 9995 | Any future | Any 3 digits | Network Error |

## API Testing with Curl

### 1. Request Payment (Doctor)
```bash
curl -X POST http://localhost:5099/api/doctor/appointments/1/request-payment \
  -H "Content-Type: application/json" \
  -d '{"doctorId": 1, "amount": 500}'
```

### 2. Initiate Payment (Patient)
```bash
curl -X POST http://localhost:5099/api/patient/appointments/1/initiate-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

Response:
```json
{
  "orderId": "order_xxxxx",
  "amount": 500,
  "currency": "INR",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "razorpayKeyId": "rzp_test_N3KvLi4MscHdXl"
}
```

### 3. Verify Payment (Patient)
```bash
curl -X POST http://localhost:5099/api/patient/appointments/1/verify-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "paymentId": "pay_xxxxx",
    "signature": "xxxxx"
  }'
```

### 4. Check Payment Status
```bash
curl -X GET http://localhost:5099/api/patient/appointments/1/payment-status \
  -H "Authorization: Bearer <token>"
```

Response:
```json
{
  "appointmentId": 1,
  "paymentRequired": true,
  "paymentAmount": 500,
  "paymentStatus": "Completed",
  "appointmentStatus": "Approved",
  "payment": {
    "id": 1,
    "razorpayOrderId": "order_xxxxx",
    "razorpayPaymentId": "pay_xxxxx",
    "paymentStatus": "Completed",
    "completedAt": "2024-12-30T10:30:00Z"
  }
}
```

## Common Issues & Solutions

### Issue: "Payment not required for this appointment"
**Cause**: Doctor hasn't requested payment yet
**Solution**: Doctor must click "Approve" and enter amount

### Issue: Razorpay modal doesn't appear
**Cause**: Script not loading from CDN
**Solution**: 
- Check browser console for errors
- Verify internet connection
- Try refreshing page

### Issue: "Invalid payment signature"
**Cause**: Payment data was tampered with
**Solution**: 
- Retry payment with fresh order
- Clear browser cache
- Contact support if persists

### Issue: Payment succeeds but status not updating
**Cause**: Network latency in verification
**Solution**: 
- Wait a few seconds
- Refresh page
- Check payment status endpoint

## Database Inspection

### View Payments Table
```sql
SELECT * FROM Payments;
SELECT * FROM Appointments WHERE PaymentRequired = true;
```

### Check Payment Status
```sql
SELECT 
  a.Id, 
  a.Status, 
  a.PaymentRequired, 
  a.PaymentAmount, 
  a.PaymentStatus,
  p.PaymentStatus as ActualPaymentStatus,
  p.CompletedAt
FROM Appointments a
LEFT JOIN Payments p ON a.Id = p.AppointmentId
ORDER BY a.CreatedAt DESC;
```

## Testing Checklist

- [ ] Doctor can approve appointment with payment request
- [ ] Patient sees payment request in appointments
- [ ] "Pay Now" button appears for pending payments
- [ ] Razorpay modal opens correctly
- [ ] Test payment succeeds
- [ ] Payment status updates to "Completed"
- [ ] Badge shows "Payment Complete"
- [ ] Failed payments show error message
- [ ] Payment data persists in database
- [ ] Multiple appointments show correct payment status

## Performance Testing

### Load Test Payment Creation
```bash
# Test creating 100 payment orders simultaneously
for i in {1..100}; do
  curl -X POST http://localhost:5099/api/doctor/appointments/1/request-payment \
    -H "Content-Type: application/json" \
    -d '{"doctorId": 1, "amount": 500}' &
done
```

## Security Testing

### Test 1: Unauthorized Payment Request
```bash
# Try requesting payment for another doctor's appointment
curl -X POST http://localhost:5099/api/doctor/appointments/1/request-payment \
  -H "Content-Type: application/json" \
  -d '{"doctorId": 999, "amount": 500}'
```
Expected: 401 Unauthorized

### Test 2: Invalid Signature
```bash
# Try verifying with wrong signature
curl -X POST http://localhost:5099/api/patient/appointments/1/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "pay_xxxxx",
    "signature": "wrong_signature"
  }'
```
Expected: 400 Bad Request - Invalid signature

### Test 3: Double Payment
```bash
# Try paying twice for same appointment
# First payment: succeeds
# Second payment: should fail with "Payment already completed"
```

## Production Checklist

Before deploying to production:
- [ ] Change Razorpay test credentials to live credentials
- [ ] Update payment amount validation rules
- [ ] Add logging for payment transactions
- [ ] Set up payment failure email notifications
- [ ] Configure payment receipt generation
- [ ] Test with live Razorpay account
- [ ] Implement payment retry logic
- [ ] Add payment timeout handling
- [ ] Update privacy policy for payment data
- [ ] Set up payment reconciliation process

## Useful Links

- [Razorpay API Documentation](https://razorpay.com/docs/api/)
- [Razorpay Checkout Documentation](https://razorpay.com/docs/checkout/)
- [Razorpay Test Account](https://dashboard.razorpay.com)
- [Payment Security Best Practices](https://owasp.org/www-community/attacks/Payment_Card_Industry_Data_Security_Standard)
