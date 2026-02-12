const https = require("https");
const fs = require("fs");

const friendCodes = [
  "2067-6146-8941"
  // Add more FCs here
];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject("Invalid JSON");
        }
      });
    }).on("error", reject);
  });
}

function fetchMii(pid) {
  return new Promise((resolve) => {
    const soap = `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
<SOAP-ENV:Body>
<SearchForRecords xmlns="http://gamespy.net/sake">
<gameid>1687</gameid>
<secretKey>9Rmy</secretKey>
<loginTicket>23c715d620f986c22Pwwii</loginTicket>
<tableid>FriendInfo</tableid>
<filter>ownerid=${pid}</filter>
<fields><string>info</string></fields>
</SearchForRecords>
</SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

    const req = https.request({
      hostname: "mariokartwii.sake.gs.wiimmfi.de",
      path: "/SakeStorageServer/StorageServer.asmx",
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        "SOAPAction": "http://gamespy.net/sake/SearchForRecords",
        "User-Agent": "GameSpyHTTP/1.0"
      }
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        const match = data.match(/<value>(.*?)<\/value>/);
        resolve(match ? match[1] : null);
      });
    });

    req.write(soap);
    req.end();
  });
}

async function build() {
  const result = {};

  for (const fc of friendCodes) {
    console.log("Processing", fc);

    const clean = fc.replace(/-/g, "");

    try {
      const player = await fetchJSON(
        `https://wiimmfi.de/api/player/${clean}`
      );

      if (!player || !player.pid) {
        console.log("No PID found");
        continue;
      }

      const pid = player.pid;
      const base64 = await fetchMii(pid);

      if (!base64) {
        console.log("No Mii found");
        continue;
      }

      result[fc] = {
        pid,
        mii_full_body:
          `https://mii-unsecure.ariankordi.net/miis/image.png?data=` +
          encodeURIComponent(base64) +
          `&type=all_body_sugar&width=512&shaderType=wiiu_blinn`
      };

    } catch (err) {
      console.log("Error:", err);
    }
  }

  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }

  fs.writeFileSync("data/miis.json", JSON.stringify(result, null, 2));

  console.log("Finished building data/miis.json");
}

build();
