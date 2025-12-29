const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

// Helper functions
function formatDate(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2,
    }).format(amount);
}

// Main function
async function sendTestEmail() {
    console.log('Using SMTP User:', env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT || 587),
        secure: Number(env.SMTP_PORT) === 465,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });

    const payload = {
        guestFirstName: "Test",
        guestLastName: "User",
        guestEmail: "johnharper225566@gmail.com",
        guestPhone: "+233 20 000 0000",
        guestCountry: "Ghana",
        roomName: "Executive Suite",
        roomImage: "https://res.cloudinary.com/duew1upso/image/upload/v1/northern_capital/rooms/hero.jpg",
        checkIn: new Date(Date.now() + 86400000),
        checkOut: new Date(Date.now() + 86400000 * 3),
        nights: 2,
        adults: 2,
        children: 1,
        totalGuests: 3,
        numberOfRooms: 1,
        totalAmount: 2500,
        bookingReference: "TEST-REF-12345",
    };

    const {
        guestFirstName, guestLastName, guestEmail, guestPhone, guestCountry,
        roomName, roomImage, checkIn, checkOut,
        nights, adults, children, totalGuests, numberOfRooms, totalAmount, bookingReference
    } = payload;

    const subject = `Your Booking Confirmation - ${bookingReference}`;

    // COPY OF HTML TEMPLATE
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #ffffff; padding: 30px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
      <div style="font-size: 14px; font-weight: 700; color: #01a4ff; text-transform: uppercase; letter-spacing: 2px;">Northern Capital Hotel</div>
    </div>

    <!-- Hero Image -->
    ${roomImage ? `
    <div style="width: 100%; height: 240px; background-color: #f1f5f9;">
      <img src="${roomImage}" alt="${roomName}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
    </div>
    ` : ''}

    <!-- Content -->
    <div style="padding: 40px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="background-color: #ecfdf5; color: #059669; border: 1px solid #d1fae5; padding: 6px 16px; border-radius: 99px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Booking Confirmed</span>
        <h1 style="margin: 24px 0 8px 0; font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1.2;">You're going to Tamale!</h1>
        <p style="margin: 0; font-size: 16px; color: #64748b;">Your stay at Northern Capital Hotel is confirmed.</p>
      </div>

      <!-- Key Details Card -->
      <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <div style="margin-bottom: 24px; text-align: center;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Booking Reference</div>
          <div style="font-size: 24px; font-family: monospace; font-weight: 700; color: #0f172a; margin-top: 4px; letter-spacing: 2px;">${bookingReference}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; padding-bottom: 24px; vertical-align: top;">
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Check-in</div>
              <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${formatDate(checkIn)}</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 2px;">After 2:00 PM</div>
            </td>
            <td style="width: 50%; padding-bottom: 24px; vertical-align: top;">
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Check-out</div>
              <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${formatDate(checkOut)}</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 2px;">Before 11:00 AM</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 0; vertical-align: top;">
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Room</div>
              <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${roomName}</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 2px;">${numberOfRooms} Room${numberOfRooms > 1 ? 's' : ''}, ${nights} Night${nights > 1 ? 's' : ''}</div>
            </td>
             <td style="padding-bottom: 0; vertical-align: top;">
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Guests</div>
              <div style="font-size: 16px; font-weight: 600; color: #0f172a;">${totalGuests} Guest${totalGuests > 1 ? 's' : ''}</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 2px;">${adults} Adult${adults !== 1 ? 's' : ''}${children ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Payment Summary -->
      <div style="margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase;">Payment Summary</h3>
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #f8fafc; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; font-weight: 600; color: #0f172a;">Total Amount Paid</span>
            <span style="font-size: 18px; font-weight: 700; color: #01a4ff;">${formatCurrency(totalAmount)}</span>
          </div>
        </div>
        <p style="margin: 12px 0 0 0; font-size: 13px; color: #64748b; text-align: center;">Safe travels! We can't wait to host you.</p>
      </div>

      <!-- Guest Details -->
      <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; margin-bottom: 32px;">
        <h4 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Guest Details</h4>
        <div style="font-size: 14px; color: #334155; line-height: 1.6;">
          <p style="margin: 0;"><strong>${guestFirstName} ${guestLastName}</strong></p>
          <p style="margin: 0;">${guestEmail}</p>
          ${guestPhone ? `<p style="margin: 0;">${guestPhone}</p>` : ''}
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 32px;">
        <div style="margin-bottom: 20px;">
          <a href="${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contact" style="display: inline-block; background-color: #01a4ff; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Contact Support</a>
        </div>
        <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
          Northern Capital Hotel<br>
          Tamale, Ghana<br>
          Need help? Reply to this email.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

    try {
        console.log(`Sending email to ${guestEmail}...`);
        const info = await transporter.sendMail({
            from: env.BOOKINGS_FROM_EMAIL || env.SMTP_USER,
            to: guestEmail,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

sendTestEmail();
