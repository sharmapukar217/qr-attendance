import QRCode from "qrcode";
import { db } from "$lib/database";

export async function load(event) {
  const attendees = await db.query.attendees.findMany({
    where: (attendees, { eq }) => eq(attendees.eventId, Number(event.params.eventId))
  });

  const qr = await QRCode.toDataURL(
    JSON.stringify({
      eventId: 1,
      attendeeId: 1,
      attendeeName: "Pukar Sharma",
      attendeeEmail: "sharmapukar217@gmail.com"
    }),
    {
      margin: 0
    }
  );

  return { attendees, qr };
}
