const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { decrypt } = require("./encription");

const sesClient = new SESClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function sendEmail(body) {
  const params = {
    Destination: {
      ToAddresses: [decrypt(body._id, body.email)],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: basicformat(body),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: body.hotelId.name + " - " + body._id,
      },
    },
    Source: "BookingList<no-reply@bookinglist.in>",
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

const basicformat = (data) => {
  return `Dear ${decrypt(data._id, data.name)},

  Thank you for choosing BookingList!
  Your booking is confirmed.

  Booking ID : ${data._id}
  Guest Name: ${decrypt(data._id, data.name)}
  Adult : ${data.adults}
  Kid : ${data.children}
  Check-in: ${new Date(new Date(data.fromDate).setHours(12, 0, 0, 0))}
  Check-out: ${new Date(
    new Date(new Date().setDate(new Date(data.toDate).getDate() + 1)).setHours(
      10,
      0,
      0,
      0
    )
  )}
  Rooms: ${data.rooms.join(", ")}
  Hotel Address: ${data.hotelId.location || ""}
  Contact: ${data.hotelId.ph1}
  Total amount: ${data.totalPrice}
  Advance payment: ${data.advanceAmount}
  Balance payment: ${data.totalPrice - data.advanceAmount}
  
  We look forward to welcoming you!
  Best regards,
  ${data.hotelId.name}

  Website: https://bookinglist.in/${data.hotelId.url}`;
};

module.exports = { sendEmail };
