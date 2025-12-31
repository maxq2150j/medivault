# MediVault Payment Gateway Integration - Implementation Guide

## Overview
Successfully integrated Razorpay payment gateway for appointment payments in MediVault. Doctors can now request payment from patients before approving appointments, and patients can pay using Razorpay test mode.

## Implementation Summary

### Backend Changes

#### 1. **New Payment Model** ([Payment.cs](Models/Payment.cs))
- Created `Payment` entity with fields:
  - `Id`: Primary key
  - `AppointmentId`: Foreign key to Appointment
  - `Amount`: Payment amount in rupees
  - `PaymentStatus`: Pending, Completed, Failed, Cancelled
  - `RazorpayOrderId`: Razorpay order ID
  - `RazorpayPaymentId`: Razorpay payment ID
  - `RazorpaySignature`: Payment signature for verification
  - `RequestedAt`: Timestamp when payment was requested
  - `CompletedAt`: Timestamp when payment was completed
  - `FailureReason`: Reason if payment failed

#### 2. **Updated Appointment Model** ([Appointment.cs](Models/Appointment.cs))
Added payment-related fields:
- `PaymentRequired`: Boolean flag indicating if payment is required
- `PaymentAmount`: Decimal amount to be paid
- `PaymentStatus`: Status of payment (NotRequested, Pending, Completed, Failed)

#### 3. **Payment Service** ([PaymentService.cs](Services/PaymentService.cs))
Created comprehensive payment service with:
- **Razorpay Test Credentials**:
  - Key ID: `rzp_test_N3KvLi4MscHdXl`
  - Key Secret: `7xPZR9V2kJ8nLm5qW1tX3yZ`
  
- **Methods**:
  - `CreateOrderAsync()`: Creates Razorpay order
  - `GetPaymentDetailsAsync()`: Fetches payment details from Razorpay
  - `VerifyPaymentSignature()`: Verifies HMAC SHA256 signature for payment security
  - `GetRazorpayKeyId()`: Returns Key ID for frontend

#### 4. **Doctor Controller Endpoints** ([DoctorController.cs](Controllers/DoctorController.cs))

##### New Endpoints:
- **POST** `/api/doctor/appointments/{appointmentId}/request-payment`
  - Allows doctor to request payment from patient on appointment approval
  - Accepts: `{ DoctorId, Amount }`
  - Returns: Success message and payment details

- **GET** `/api/doctor/appointments/{appointmentId}/payment-status`
  - Retrieves payment status for an appointment
  - Returns: Payment details and current status

#### 5. **Patient Controller Endpoints** ([PatientController.cs](Controllers/PatientController.cs))

##### Updated Endpoints:
- **GET** `/api/patient/appointments`
  - Now includes `PaymentRequired`, `PaymentAmount`, `PaymentStatus` fields

##### New Endpoints:
- **POST** `/api/patient/appointments/{appointmentId}/initiate-payment`
  - Initiates Razorpay payment order for patient
  - Returns: Order ID, Amount, Razorpay Key ID, patient details
  - Used by frontend to open Razorpay modal

- **POST** `/api/patient/appointments/{appointmentId}/verify-payment`
  - Verifies payment signature and marks payment as completed
  - Accepts: `{ PaymentId, Signature }`
  - Returns: Payment status confirmation

- **GET** `/api/patient/appointments/{appointmentId}/payment-status`
  - Retrieves current payment status for appointment

#### 6. **Database Migration** ([20251230000000_AddPaymentSupport.cs](Migrations/20251230000000_AddPaymentSupport.cs))
- Adds `Payments` table with proper indexes
- Adds columns to `Appointments` table for payment tracking
- Sets up foreign key relationships

#### 7. **Program.cs Registration**
- Registered `PaymentService` as scoped service

### Frontend Changes

#### 1. **Doctor Dashboard** ([DoctorDashboard.jsx](src/pages/DoctorDashboard.jsx))

**New State**:
```javascript
const [paymentModal, setPaymentModal] = useState({ 
  show: false, 
  appointmentId: null, 
  patientName: '', 
  amount: '' 
});
```

**New Functions**:
- `updateAppointmentStatus()`: Modified to show payment modal on "Approve" action
- `requestPaymentFromPatient()`: Submits payment request to backend

**New UI**:
- Payment Request Modal with:
  - Patient name (read-only)
  - Payment amount input field
  - Submit button to send payment request
  - Cancel button to close modal

#### 2. **Patient Dashboard** ([PatientDashboard.jsx](src/pages/PatientDashboard.jsx))

**New State**:
```javascript
const [paymentModal, setPaymentModal] = useState({ 
  show: false, 
  appointmentId: null, 
  amount: 0, 
  orderId: null 
});
```

**New Functions**:
- `loadRazorpayScript()`: Dynamically loads Razorpay checkout script
- `handlePayNow()`: 
  - Initiates payment order
  - Opens Razorpay payment modal
  - Verifies payment signature on completion
  - Updates appointment status

**Enhanced Appointments Display**:
- Shows payment amount if payment is required
- Displays payment status (Pending/Paid)
- Shows "Pay Now" button when payment is pending
- Displays confirmation badge when payment is completed

**UI Improvements**:
- Color-coded payment status badges
- Organized appointment information with payment details
- Clean, user-friendly payment button

### Installation & Setup

#### Backend Setup:
1. Install dependencies:
   ```bash
   dotnet add package RestSharp --version 107.3.0
   dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.0
   ```

2. Apply database migration:
   ```bash
   dotnet ef database update
   ```

3. The PaymentService uses Razorpay test credentials automatically

#### Frontend Setup:
1. Razorpay package is installed:
   ```bash
   npm install razorpay
   ```

2. Razorpay checkout script loads dynamically from CDN when needed

### Workflow

#### Doctor's Workflow:
1. Doctor views pending appointments
2. Clicks "Approve" button on appointment
3. Payment modal appears requesting amount
4. Doctor enters payment amount (e.g., ₹500)
5. Clicks "Send Payment Request"
6. Appointment is approved with payment marked as "Pending"
7. Patient sees payment request

#### Patient's Workflow:
1. Patient views appointments
2. Sees appointment with payment request (e.g., "₹500 | Pending")
3. Clicks "Pay Now" button
4. Razorpay payment modal opens (Razorpay test mode)
5. Patient enters payment details and completes payment
6. System verifies payment signature
7. Payment marked as "Completed" and badge shows confirmation

### Razorpay Test Mode Details

**Test Credentials Available**:
- Key ID: `rzp_test_N3KvLi4MscHdXl`
- Key Secret: `7xPZR9V2kJ8nLm5qW1tX3yZ`

**Test Payment Cards** (Razorpay provides):
- Visa: 4111 1111 1111 1111
- Mastercard: 5555 5555 5555 4444
- Rupay: 6074 0000 0000 0001

**Test Payment Details**:
- Expiry: Any future date
- CVV: Any 3 digits

### Security Features

1. **HMAC SHA256 Signature Verification**:
   - All payments verified using secret key
   - Prevents payment tampering

2. **Server-side Verification**:
   - Payment signature verified on backend
   - Client-side validation is secondary

3. **Payment Status Tracking**:
   - Clear audit trail with timestamps
   - Failed payment reasons recorded

4. **Authorization**:
   - Doctors can only request payment for their appointments
   - Patients can only pay for their appointments

### API Endpoints Summary

| Method | Endpoint | Role | Purpose |
|--------|----------|------|---------|
| POST | `/api/doctor/appointments/{id}/request-payment` | Doctor | Request payment from patient |
| GET | `/api/doctor/appointments/{id}/payment-status` | Doctor | Check payment status |
| POST | `/api/patient/appointments/{id}/initiate-payment` | Patient | Start payment process |
| POST | `/api/patient/appointments/{id}/verify-payment` | Patient | Verify and confirm payment |
| GET | `/api/patient/appointments/{id}/payment-status` | Patient | Check payment status |
| GET | `/api/patient/appointments` | Patient | List appointments (includes payment info) |

### Error Handling

**Backend Returns**:
- Clear error messages for failed payment creation
- Validation for payment amounts
- Status checks before allowing duplicate payments

**Frontend Handles**:
- Network errors during payment initiation
- Razorpay modal dismissals
- Payment verification failures
- Displays user-friendly error messages

### Testing

1. **Test Payment Flow**:
   - Create appointment as patient
   - Doctor approves and requests payment (₹100)
   - Patient clicks "Pay Now"
   - Use test card: 4111 1111 1111 1111
   - Payment completes successfully

2. **Test Failure Scenarios**:
   - Try paying with declined card
   - Close payment modal prematurely
   - Verify appropriate error messages

### Future Enhancements

1. Payment receipts/invoices
2. Refund capability for doctors
3. Subscription-based payment plans
4. Multiple payment gateway support
5. Payment analytics dashboard
6. Email receipts to patients
7. Recurring appointment payment plans

### Troubleshooting

**Payment Not Creating Order**:
- Verify Razorpay credentials are valid
- Check internet connectivity
- Review backend logs for API errors

**Signature Verification Fails**:
- Ensure PaymentId and OrderId are correct
- Verify Razorpay Key Secret matches
- Check for case-sensitivity in signature

**Razorpay Modal Not Opening**:
- Verify CDN script loaded successfully
- Check browser console for errors
- Ensure Key ID is valid for test mode

---

## Files Modified/Created

### Created Files:
- `Models/Payment.cs`
- `Services/PaymentService.cs`
- `Migrations/20251230000000_AddPaymentSupport.cs`

### Modified Files:
- `Models/Appointment.cs`
- `Data/AppDbContext.cs`
- `Controllers/DoctorController.cs`
- `Controllers/PatientController.cs`
- `Program.cs`
- `src/pages/DoctorDashboard.jsx`
- `src/pages/PatientDashboard.jsx`

### Dependencies Added:
- RestSharp (for HTTP requests)
- Microsoft.EntityFrameworkCore.Design (for migrations)
- razorpay (npm package - pre-installed)
