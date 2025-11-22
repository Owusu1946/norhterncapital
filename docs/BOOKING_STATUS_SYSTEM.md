# Booking Check-In/Check-Out Status System

This document explains the check-in/check-out status tracking system for Northern Capital Hotel bookings.

## Overview

The system tracks three distinct statuses for each booking:
1. **Booking Status** - Overall reservation status (confirmed, cancelled, completed)
2. **Payment Status** - Payment state (paid, pending, refunded)
3. **Check-In Status** - Physical presence at hotel (not-checked-in, checked-in, checked-out)

## Check-In Status States

### 1. Not Checked In (Default)
- **Status:** `not-checked-in`
- **Badge Color:** Yellow
- **Icon:** Clock
- **Description:** Guest has a confirmed booking but hasn't arrived at the hotel yet
- **When:** From booking creation until receptionist checks them in

### 2. Checked In
- **Status:** `checked-in`
- **Badge Color:** Blue
- **Icon:** Check Circle
- **Description:** Guest is currently staying at the hotel
- **When:** After receptionist checks them in at the front desk
- **Records:** `actualCheckInTime` timestamp

### 3. Checked Out
- **Status:** `checked-out`
- **Badge Color:** Gray
- **Icon:** Check Circle
- **Description:** Guest has completed their stay and left the hotel
- **When:** After receptionist checks them out at the front desk
- **Records:** Both `actualCheckInTime` and `actualCheckOutTime` timestamps

## Data Structure

```typescript
interface Booking {
  // ... other fields
  checkInStatus: "not-checked-in" | "checked-in" | "checked-out";
  actualCheckInTime?: string;  // ISO 8601 timestamp
  actualCheckOutTime?: string; // ISO 8601 timestamp
}
```

## User Experience

### On Bookings Page

**Status Badges:**
- Two badges displayed for each booking:
  1. Booking Status (Confirmed/Cancelled/Completed)
  2. Check-In Status (Not Checked In/Checked In/Checked Out)

**Reception Activity Section:**
- Only shown when actual check-in or check-out has occurred
- Displays formatted timestamps:
  - ✓ Checked in: Nov 18, 2024, 3:45 PM
  - ✓ Checked out: Nov 22, 2024, 11:30 AM

### Example Scenarios

**Scenario 1: Future Booking**
```
Booking Status: Confirmed
Check-In Status: Not Checked In
Reception Activity: (not shown)
```

**Scenario 2: Currently Staying**
```
Booking Status: Confirmed
Check-In Status: Checked In
Reception Activity:
  ✓ Checked in: Nov 18, 2024, 3:45 PM
```

**Scenario 3: Completed Stay**
```
Booking Status: Completed
Check-In Status: Checked Out
Reception Activity:
  ✓ Checked in: Nov 18, 2024, 3:45 PM
  ✓ Checked out: Nov 22, 2024, 11:30 AM
```

## Receptionist Workflow (To Be Implemented)

### Check-In Process
1. Guest arrives at reception
2. Receptionist searches for booking by reference number or guest name
3. Receptionist clicks "Check In" button
4. System updates:
   - `checkInStatus` → `"checked-in"`
   - `actualCheckInTime` → current timestamp
5. Guest receives room key and welcome information

### Check-Out Process
1. Guest returns to reception to check out
2. Receptionist searches for active booking
3. Receptionist clicks "Check Out" button
4. System updates:
   - `checkInStatus` → `"checked-out"`
   - `actualCheckOutTime` → current timestamp
   - `status` → `"completed"` (if not already)
5. Final bill is generated and payment confirmed

## API Integration (Future)

### Update Check-In Status Endpoint
```typescript
POST /api/bookings/:bookingId/check-in
Body: {
  action: "check-in" | "check-out"
}

Response: {
  success: true,
  booking: {
    id: string,
    checkInStatus: string,
    actualCheckInTime?: string,
    actualCheckOutTime?: string
  }
}
```

### Get Bookings with Status
```typescript
GET /api/bookings?userId=xxx

Response: {
  bookings: [
    {
      id: string,
      // ... all booking fields including check-in status
    }
  ]
}
```

## Database Schema Updates

When implementing the backend, add these fields to your bookings table:

```sql
ALTER TABLE bookings ADD COLUMN check_in_status VARCHAR(20) DEFAULT 'not-checked-in';
ALTER TABLE bookings ADD COLUMN actual_check_in_time TIMESTAMP NULL;
ALTER TABLE bookings ADD COLUMN actual_check_out_time TIMESTAMP NULL;

-- Add index for faster queries
CREATE INDEX idx_bookings_check_in_status ON bookings(check_in_status);
```

## Business Rules

1. **Check-In Allowed:**
   - Booking status must be "confirmed"
   - Payment status must be "paid"
   - Check-in date must be today or in the past
   - Current status must be "not-checked-in"

2. **Check-Out Allowed:**
   - Current status must be "checked-in"
   - Cannot check out before checking in

3. **Automatic Status Updates:**
   - When checked out, booking status automatically becomes "completed"
   - Late check-outs can be flagged for additional charges

4. **Cancellation Rules:**
   - Cannot cancel if already checked in
   - Cancelled bookings remain "not-checked-in"

## Notifications (Future Enhancement)

### Check-In Notifications
- Email confirmation sent to guest
- SMS with room number and WiFi password
- Push notification if mobile app exists

### Check-Out Notifications
- Email receipt with final charges
- Thank you message with loyalty points earned
- Request for review/feedback

## Reports (Future Enhancement)

### For Hotel Management
- Daily check-in/check-out report
- Current occupancy (checked-in guests)
- Expected arrivals (not-checked-in with today's date)
- Expected departures (checked-in with today's checkout)
- Late checkouts
- No-shows (not-checked-in past check-in date)

## Security Considerations

1. **Authorization:**
   - Only receptionists can update check-in status
   - Guests can only view their own bookings
   - Managers can view all bookings

2. **Audit Trail:**
   - Log who performed check-in/check-out
   - Track timestamp of status changes
   - Record any modifications to check-in times

3. **Validation:**
   - Verify booking exists and belongs to guest
   - Ensure logical status transitions
   - Prevent duplicate check-ins

## Testing Scenarios

1. **Happy Path:**
   - Book → Pay → Check-In → Check-Out

2. **Edge Cases:**
   - Early check-in (before scheduled date)
   - Late check-out (after scheduled date)
   - Same-day booking and check-in
   - Multi-day stays

3. **Error Cases:**
   - Check-out without check-in
   - Check-in with unpaid booking
   - Check-in for cancelled booking

## Mobile Responsiveness

The check-in status badges and reception activity section are fully responsive:
- Badges stack on mobile devices
- Timestamps format appropriately for small screens
- Touch-friendly interface for receptionist dashboard (future)

## Accessibility

- Color-coded badges also include icons for colorblind users
- Screen reader friendly labels
- Keyboard navigation support
- High contrast text for readability
