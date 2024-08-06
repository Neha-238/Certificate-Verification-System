import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export const generatePDF = async (certificateData) => {
  try {
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 400]);

    // Load fonts
    const helveticaFont = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await doc.embedFont(StandardFonts.HelveticaBold);

    // Draw border
    const borderWidth = 10;
    page.drawRectangle({
      x: borderWidth / 2,
      y: borderWidth / 2,
      width: page.getWidth() - borderWidth,
      height: page.getHeight() - borderWidth,
      borderWidth: borderWidth,
      color: rgb(1, 1, 1),
      borderColor: rgb(54 / 255, 75 / 255, 197 / 255),
    });

    // Title
    page.drawText("Certificate of Completion", {
      x:
        page.getWidth() / 2 -
        helveticaBoldFont.widthOfTextAtSize("Certificate of Completion", 30) /
          2,
      y: page.getHeight() - 80,
      size: 30,
      color: rgb(255 / 255, 119 / 255, 0 / 255),
      font: helveticaBoldFont,
    });

    // Subtitle
    page.drawText("This is to certify that", {
      x:
        page.getWidth() / 2 -
        helveticaFont.widthOfTextAtSize("This is to certify that", 18) / 2,
      y: page.getHeight() - 130,
      size: 18,
      color: rgb(0, 0, 0),
      font: helveticaFont,
    });

    // Recipient Name
    page.drawText(certificateData.name, {
      x:
        page.getWidth() / 2 -
        helveticaBoldFont.widthOfTextAtSize(certificateData.name, 22) / 2,
      y: page.getHeight() - 160,
      size: 22,
      color: rgb(0, 0, 0),
      font: helveticaBoldFont,
    });

    // Body Text
    page.drawText("has successfully completed the internship program in", {
      x:
        page.getWidth() / 2 -
        helveticaFont.widthOfTextAtSize(
          "has successfully completed the internship program in",
          16
        ) /
          2,
      y: page.getHeight() - 200,
      size: 16,
      color: rgb(0, 0, 0),
      font: helveticaFont,
    });

    // Internship Domain
    page.drawText(certificateData.internshipDomain, {
      x:
        page.getWidth() / 2 -
        helveticaBoldFont.widthOfTextAtSize(
          certificateData.internshipDomain,
          18
        ) /
          2,
      y: page.getHeight() - 230,
      size: 18,
      color: rgb(0, 0, 0),
      font: helveticaBoldFont,
    });

    // Date Range
    const dateRangeText = `from ${new Date(
      certificateData.internshipStartDate
    ).toLocaleDateString()} to ${new Date(
      certificateData.internshipEndDate
    ).toLocaleDateString()}.`;
    page.drawText(dateRangeText, {
      x:
        page.getWidth() / 2 -
        helveticaFont.widthOfTextAtSize(dateRangeText, 16) / 2,
      y: page.getHeight() - 260,
      size: 16,
      color: rgb(0, 0, 0),
      font: helveticaFont,
    });

    // Issued Date, Certificate ID, and Authorized Signature
    const infoTextX = 50;
    const initialInfoTextY = 80; // Adjust this value to place the text higher
    const infoTextGap = 20;

    const issuedDateText = `Issued on: ${new Date().toLocaleDateString()}`;
    page.drawText(issuedDateText, {
      x: infoTextX,
      y: initialInfoTextY,
      size: 16,
      color: rgb(0, 0, 0),
      font: helveticaFont,
    });

    const certificateIdText = `Certificate ID: ${certificateData.certificateId}`;
    page.drawText(certificateIdText, {
      x: infoTextX,
      y: initialInfoTextY - infoTextGap,
      size: 16,
      color: rgb(0, 0, 0),
      font: helveticaFont,
    });

    const authorizedSignatureText = `Authorized Signature:`;
    page.drawText(authorizedSignatureText, {
      x: infoTextX,
      y: initialInfoTextY - 2 * infoTextGap,
      size: 16,
      color: rgb(0, 0, 0),
      font: helveticaFont,
    });

    const pdfBytes = await doc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
