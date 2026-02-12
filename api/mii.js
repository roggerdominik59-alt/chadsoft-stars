const https = require("https");

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
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
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        const match = data.match(/<value>(.*?)<\/value>/);
        resolve(match ? match[1] : null);
      });
    });

    req.write(soap);
    req.end();
  });
}

module.exports = async (req, res) => {
  try {
    const fc = req.query.fc;

    if (!fc) {
      return res.status(400).json({ error: "Missing friend code" });
    }

    const clean = fc.replace(/-/g, "");

    // 1️⃣ Get PID from Wiimmfi
    const player = await fetchJSON(
      `https://wiimmfi.de/api/player/${clean}`
    );

    if (!player || !player.pid) {
      return res.status(404).json({ error: "FC not found" });
    }

    const pid = player.pid;

    // 2️⃣ Get base64 Mii
    const base64 = await fetchMii(pid);

    if (!base64) {
      return res.status(404).json({ error: "No Mii found" });
    }

    // 3️⃣ Build render URL
    const renderUrl =
      `https://mii-unsecure.ariankordi.net/miis/image.png?data=` +
      encodeURIComponent(base64) +
      `&type=all_body_sugar&width=512&shaderType=wiiu_blinn`;

    res.status(200).json({
      fc,
      pid,
      image: renderUrl
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
