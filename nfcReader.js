const { NFC } = require("nfc-pcsc");
const moment = require("moment");
const { handleScan } = require("./services/scanController");
const WebSocket = require("ws");
const signale = require("signale");

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  signale.success("Connected to WebSocket server");
});

ws.on("error", (err) => {
  signale.error(`WebSocket error: ${err}`);
});

const nfc = new NFC();

nfc.on("reader", (reader) => {
  let readers = reader.reader.name;
  signale.info(`${reader.reader.name} device attached`);

  reader.on("card", async (card) => {
    try {
      const data = await reader.read(0, 128); // (offset, length)
      const rawData = data.toString("utf8");
      const hashRegex = /[a-f0-9]{64}/; // expression for SHA-256 hash
      const match = rawData.match(hashRegex);

      // Initialize green LED and buzzer
      await activateGreenLedAndBuzzer(reader);

      if (match) {
        readers = readers.slice(-1);
        const hash = match[0];
        const timestamp = moment().toISOString();
        const response = await handleScan(hash, timestamp, readers);

        const formattedTimestamp = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
        if (
          response.message !== "Student not found" &&
          response.message !== "Scan failed. Cooldown." &&
          response.message !== "Error reading data" &&
          response.message !== "Internal Server Error"
        ) {
          signale.complete({
            prefix: '[scan]',
            message: `Scan Success: ${response.student.fname} ${response.student.lname} at Scanner ${Number(readers) + 1} (${formattedTimestamp})`,
          });

          // Send success response to WebSocket
          ws.send(JSON.stringify(response));

          await activateRedLedAndStopBuzzer(reader);
        } else {
          signale.warn("Scanner #" + (Number(readers) + 1) + " Failed:", response);

          ws.send(
            JSON.stringify({
              message: response.message,
              scanner: readers,
            })
          );
          await activateRedLedAndStopBuzzer(reader);
        }
      } else {
        ws.send(
          JSON.stringify({ message: "SHA-256 hash not found in the data" })
        );
        await activateRedLedAndStopBuzzer(reader);
      }
    } catch (err) {
      signale.error(`Error reading data: ${err}`);
      if (err.name === "ReadError" && err.statusCode === 0x6300) {
        ws.send(
          JSON.stringify({
            message: "No student found. Read operation failed.",
          })
        );
      } else {
        ws.send(
          JSON.stringify({ message: "Error reading data", error: err.message })
        );
      }
      await activateRedLedAndStopBuzzer(reader);
    }
  });

  reader.on("error", (err) => {
    signale.error(`Error: ${err}`);
  });

  reader.on("end", () => {
    signale.info("Reader disconnected");
  });
});

nfc.on("error", (err) => {
  signale.error(`NFC error: ${err}`);
});

async function activateGreenLedAndBuzzer(reader) {
  try {
    reader.control = reader.transmit;
    const greenCommand = Buffer.from([
      0xff, 0x00, 0x40, 0x2e, 0x04, 0x01, 0x00, 0x01, 0x01,
    ]);
    await reader.control(greenCommand, 40);
  } catch (err) {
    signale.error(`Error when activating green LED and buzzer: ${err}`);
  }
}

async function activateRedLedAndStopBuzzer(reader) {
  try {
    const redCommand = Buffer.from([
      0xff, 0x00, 0x40, 0x5d, 0x04, 0x02, 0x01, 0x05, 0x01,
    ]);
    await reader.control(redCommand, 40);
  } catch (err) {
    signale.error(`Error when activating red LED and stopping buzzer: ${err}`);
  } finally {
    try {
      await reader.disconnect();
    } catch (disconnectErr) {
      signale.error(`Error disconnecting reader: ${disconnectErr}`);
    }
  }
}