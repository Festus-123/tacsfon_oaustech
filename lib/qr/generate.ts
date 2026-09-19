import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1B4332", // Forest green
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Error generating QR code data URL:", err);
    return "";
  }
}
