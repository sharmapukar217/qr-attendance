import QRCode from "qrcode";
import { text } from "@sveltejs/kit";

export const GET = async () => {
  const qr = await QRCode.toDataURL(JSON.stringify({ eventId: 1, audienceId: 1 }));
  return text(`<img src="${qr}" alt="QR Code"/>`, {
    headers: { "Content-Type": "text/html" }
  });
};
