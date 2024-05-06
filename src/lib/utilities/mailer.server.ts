import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { env } from "$env/dynamic/private";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: env.SMTP_SECURE === "true",
  auth: { user: env.SMTP_ACCESS_KEY, pass: env.SMTP_SECRET_KEY }
});

export const filterEmails = (emails: string[]) => {
  return emails.filter((email) => EMAIL_REGEX.test(email));
};

type InvitationData = {
  email: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;

  eventId: number;
  attendeeId: number;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhoneNumber: string | null;
};

export const bulkSendInvitations = async (data: InvitationData[]) => {
  const success: Pick<InvitationData, "email" | "attendeeId">[] = [];

  for (const d of data) {
    console.info(`Sending email to: ${d.email}`);

    try {
      const qr = await QRCode.toDataURL(JSON.stringify(d));
      transporter.sendMail({
        attachDataUrls: true,
        from: env.MAIL_FROM,
        to: d.email,
        subject: `Invited for our event \`${d.eventTitle}\``,
        html: `
        For our event ${d.eventTitle} going to be held at ${d.eventLocation}
        on date ${d.eventDate}, we would like to invite you to join us.
        Here's the qr code as an invitation. Please keep it safe. 
        Thank you!!! Hyperce!!!
        <br>
        <img src=${qr} alt="">
      `
      });
      console.info(`Email sent to: ${d.email}`);
      success.push({ attendeeId: d.attendeeId, email: d.email });
    } catch (err: any) {
      console.error(
        `Error occured while sending email to: ${d.email}; Reason: ${err.message}`
      );
    }
  }

  return success;
};
