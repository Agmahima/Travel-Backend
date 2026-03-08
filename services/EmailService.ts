import nodemailer from "nodemailer";
import Booking from "../models/Bookings";
import HotelBooking from "../models/HotelBooking";
import TransportationBooking from "../models/TransportationBooking";
import FlightBooking from "../models/FlightBooking";

export class EmailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendBookingConfirmation(bookingId: string) {
  try {

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'email name fullName')
      .populate('tripId');

    if (!booking) {
      console.log('❌ Booking not found for email');
      return;
    }

    if (!booking.userId?.email) {
      console.log('❌ User email missing');
      return;
    }

    const hotels = await HotelBooking.find({
      _id: { $in: booking.services?.hotels || [] }
    });

    const cabs = await TransportationBooking.find({
      _id: { $in: booking.services?.cabs || [] }
    });

    const flights = await FlightBooking.find({
      _id: { $in: booking.services?.flights || [] }
    });

    const userName =
      booking.userId?.fullName ||
      booking.userId?.name ||
      'Traveler';

    const totalPaid =
      booking.pricing?.totalAmount ||
      booking.paymentSummary?.totalPaid ||
      0;

    const formatDate = (date: Date | string) =>
      new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

    const html = `
    <div style="font-family: Arial, sans-serif; background:#f5f7fa; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">
        <div style="background:#0d6efd; color:#ffffff; padding:20px; text-align:center;">
          <h2 style="margin:0;">Booking Confirmed 🎉</h2>
          <p style="margin:5px 0 0;">Reference: ${booking.bookingReference}</p>
        </div>

        <div style="padding:20px;">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your trip has been successfully confirmed. Here are your details:</p>

          <hr/>

          <h3>📅 Trip Details</h3>
          <p>
            <strong>Start:</strong> ${booking.tripId ? formatDate(booking.tripId.startDate) : ''}<br/>
            <strong>End:</strong> ${booking.tripId ? formatDate(booking.tripId.endDate) : ''}
          </p>

          <hr/>

          <h3>🏨 Hotel Details</h3>
          ${(hotels || []).map((h: any) => `
            <div style="margin-bottom:10px;">
              <strong>${h.hotelDetails?.hotelName || ''}</strong><br/>
              Check-in: ${formatDate(h.stayDetails?.checkIn)}<br/>
              Check-out: ${formatDate(h.stayDetails?.checkOut)}
            </div>
          `).join('')}

          <hr/>

          <h3>🚗 Transportation</h3>
          ${(cabs || []).map((c: any) => `
            <div style="margin-bottom:10px;">
              ${c.vehicleType || ''}<br/>
              Pickup: ${c.pickupLocation || ''}
            </div>
          `).join('')}

          <hr/>

          <h3>💳 Payment Summary</h3>
          <p style="font-size:18px;">
            <strong>Total Paid: ₹${Number(totalPaid).toLocaleString()}</strong>
          </p>

          <hr/>

          <p style="font-size:13px; color:#666;">
            You can manage your booking anytime from your dashboard.
          </p>

          <p style="font-size:13px; color:#999;">
            Thank you for choosing Travel App ❤️
          </p>
        </div>
      </div>
    </div>
    `;

    const info = await this.transporter.sendMail({
      from: `"Travel App" <${process.env.EMAIL_USER}>`,
      to: booking.userId.email,
      subject: `Booking Confirmed - ${booking.bookingReference}`,
      html
    });

    console.log('✅ Email sent to:', booking.userId.email);
    console.log('📨 Message ID:', info.messageId);

  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
}

async sendCancellationEmail(bookingId: string, refundAmount: number) {
  try {

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'email name fullName')
      .populate('tripId');

    if (!booking || !booking.userId?.email) return;

    const userName =
      booking.userId.fullName ||
      booking.userId.name ||
      'Traveler';

    const html = `
    <div style="font-family: Arial, sans-serif; background:#f5f7fa; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">
        
        <div style="background:#dc3545; color:#ffffff; padding:20px; text-align:center;">
          <h2 style="margin:0;">Booking Cancelled ❌</h2>
          <p style="margin:5px 0 0;">Reference: ${booking.bookingReference}</p>
        </div>

        <div style="padding:20px;">
          <p>Hi <strong>${userName}</strong>,</p>

          <p>Your booking has been successfully cancelled.</p>

          <hr/>

          <h3>💳 Refund Details</h3>
          <p>
            <strong>Refund Amount: ₹${Number(refundAmount).toLocaleString()}</strong>
          </p>
          <p style="font-size:13px; color:#666;">
            Refund will reflect in your original payment method within 5–7 working days.
          </p>

          <hr/>

          <p style="font-size:13px; color:#999;">
            If this was not requested by you, please contact support immediately.
          </p>

        </div>
      </div>
    </div>
    `;

    const info = await this.transporter.sendMail({
      from: `"Travel App" <${process.env.EMAIL_USER}>`,
      to: booking.userId.email,
      subject: `Booking Cancelled - ${booking.bookingReference}`,
      html
    });

    console.log('📨 Cancellation Email Sent:', info.messageId);

  } catch (error) {
    console.error('❌ Cancellation email failed:', error);
  }
}

}
