import nodemailer from "nodemailer";

interface BookingEmailPayload {
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone?: string;
  guestCountry?: string;
  roomName: string;
  roomImage?: string;
  checkIn: Date | string;
  checkOut: Date | string;
  nights: number;
  adults: number;
  children: number;
  totalGuests: number;
  numberOfRooms: number;
  totalAmount: number;
  bookingReference: string;
}

function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
}

export async function sendBookingConfirmationEmail(payload: BookingEmailPayload) {
  const {
    guestFirstName,
    guestLastName,
    guestEmail,
    guestPhone,
    guestCountry,
    roomName,
    roomImage,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    totalGuests,
    numberOfRooms,
    totalAmount,
    bookingReference,
  } = payload;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const subject = `Your Booking Confirmation - ${bookingReference}`;

  const html = `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color:#f4f4f5; padding:32px 16px;">
    <div style="max-width:640px;margin:0 auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(15,23,42,0.18);">
      <div style="background:linear-gradient(135deg,#020617,#0f172a);padding:24px 28px 20px;color:white;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div>
            <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#38bdf8;font-weight:600;margin-bottom:4px;">Northern Capital Hotel</div>
            <h1 style="margin:0;font-size:22px;font-weight:700;">Booking Confirmed</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#e5e7eb;">Thank you for choosing Northern Capital Hotel. Your stay is confirmed.</p>
          </div>
          <div style="text-align:right;font-size:12px;color:#cbd5f5;">
            <div style="font-weight:600;">Reference</div>
            <div style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-size:13px;margin-top:2px;">${bookingReference}</div>
          </div>
        </div>
      </div>

      ${roomImage ? `
      <div style="position:relative;overflow:hidden;">
        <img src="${roomImage}" alt="${roomName}" style="display:block;width:100%;max-height:220px;object-fit:cover;">
      </div>` : ""}

      <div style="padding:22px 24px 10px 24px;">
        <p style="margin:0 0 16px 0;font-size:14px;color:#111827;">Dear <strong>${guestFirstName} ${guestLastName}</strong>,</p>
        <p style="margin:0 0 16px 0;font-size:13px;color:#4b5563;line-height:1.6;">
          We are delighted to confirm your reservation at <strong>Northern Capital Hotel</strong>.
          Below is a summary of your booking details.
        </p>
      </div>

      <div style="padding:0 24px 4px 24px;">
        <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:8px;">
          <div style="flex:1 1 200px;background:#f9fafb;border-radius:14px;padding:14px 14px 12px 14px;border:1px solid #e5e7eb;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#6b7280;font-weight:600;margin-bottom:6px;">Stay</div>
            <div style="font-size:14px;font-weight:600;color:#111827;margin-bottom:4px;">${roomName}</div>
            <div style="font-size:12px;color:#4b5563;">${nights} night${nights !== 1 ? "s" : ""} • ${numberOfRooms} room${numberOfRooms !== 1 ? "s" : ""}</div>
          </div>
          <div style="flex:1 1 200px;background:#f9fafb;border-radius:14px;padding:14px 14px 12px 14px;border:1px solid #e5e7eb;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#6b7280;font-weight:600;margin-bottom:6px;">Guests</div>
            <div style="font-size:13px;color:#111827;">${adults} adult${adults !== 1 ? "s" : ""}${children ? ` • ${children} child${children !== 1 ? "ren" : ""}` : ""}</div>
            <div style="font-size:12px;color:#4b5563;margin-top:2px;">Total: ${totalGuests} guest${totalGuests !== 1 ? "s" : ""}</div>
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:16px;">
          <div style="flex:1 1 200px;background:#0f172a;border-radius:14px;padding:14px 14px 12px 14px;color:white;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#38bdf8;font-weight:600;margin-bottom:6px;">Check-in</div>
            <div style="font-size:13px;font-weight:600;">${formatDate(checkIn)}</div>
          </div>
          <div style="flex:1 1 200px;background:#020617;border-radius:14px;padding:14px 14px 12px 14px;color:white;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#38bdf8;font-weight:600;margin-bottom:6px;">Check-out</div>
            <div style="font-size:13px;font-weight:600;">${formatDate(checkOut)}</div>
          </div>
        </div>
      </div>

      <div style="padding:0 24px 4px 24px;">
        <div style="border-radius:16px;background:#f9fafb;border:1px solid #e5e7eb;padding:14px 14px 10px 14px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#6b7280;font-weight:600;margin-bottom:4px;">Total Amount</div>
            <div style="font-size:18px;font-weight:700;color:#111827;">${formatCurrency(totalAmount)}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:2px;">Inclusive of room charges and selected services.</div>
          </div>
          <div style="font-size:11px;text-align:right;color:#16a34a;font-weight:600;">Paid • Booking confirmed</div>
        </div>
      </div>

      <div style="padding:18px 24px 4px 24px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#6b7280;font-weight:600;margin-bottom:6px;">Guest details</div>
        <div style="font-size:12px;color:#4b5563;line-height:1.6;">
          <div><strong>Name:</strong> ${guestFirstName} ${guestLastName}</div>
          <div><strong>Email:</strong> ${guestEmail}</div>
          ${guestPhone ? `<div><strong>Phone:</strong> ${guestPhone}</div>` : ""}
          ${guestCountry ? `<div><strong>Country:</strong> ${guestCountry}</div>` : ""}
        </div>
      </div>

      <div style="padding:18px 24px 22px 24px;border-top:1px solid #e5e7eb;margin-top:14px;">
        <p style="margin:0 0 10px 0;font-size:12px;color:#4b5563;line-height:1.6;">
          If you need to modify or cancel your reservation, please contact our team and quote your booking reference <strong>${bookingReference}</strong>.
        </p>
        <p style="margin:0;font-size:11px;color:#9ca3af;">We look forward to welcoming you to Northern Capital Hotel.</p>
      </div>
    </div>

    <p style="max-width:640px;margin:12px auto 0 auto;font-size:10px;color:#9ca3af;text-align:center;">
      This email was sent from Northern Capital Hotel. If you did not make this booking, please contact us immediately.
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: process.env.BOOKINGS_FROM_EMAIL || process.env.SMTP_USER,
    to: guestEmail,
    subject,
    html,
  });
}
