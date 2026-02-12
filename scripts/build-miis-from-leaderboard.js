import fs from "fs";
import https from "https";

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          console.error("Invalid JSON from:", url);
          reject(err);
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
<sort>recordid</sort>
<offset>0</offset>
<max>1</max>
<surrounding>0</surrounding>
<ownerids></ownerids>
<cacheFlag>0</cacheFlag>
<fields>
<string>info</string>
</fields>
</SearchForRecords>
</SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

    const options = {
      hostname: "mariokartwii.sake.gs.wiimmfi.de",
      path: "/SakeStorageServer/StorageServer.asmx",
      method: "POST",
      headers: {
        "Content-Type": "text/xml",
        "SOAPAction": "http://gamespy.net/sake/SearchForRecords",
        "User-Agent": "GameSpyHTTP/1.0"
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const match = data.match(/<value>(.*?)<\/value>/);
        resolve(match ? match[1] : null);
      });
    });

    req.on("error", () => resolve(null));
    req.write(soap);
    req.end();
  });
}

function pidToFc(pid) {
  const fcBig = BigInt(pid);
  const fcStr = fcBig.toString().padStart(12, "0");
  return fcStr.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
}

async function build() {
  const tracks = Array.from({ length: 32 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const pids = new Set();

  for (const track of tracks) {
    const url = `https://tt.chadsoft.co.uk/leaderboard/${track}.json?limit=1000`;

    try {
      const data = await fetchJSON(url);

      if (data && data.times) {
        data.times.forEach((entry) => {
          if (entry.playerId) {
            pids.add(entry.playerId); // THIS is the real PID
          }
        });
      }

      console.log("Fetched track", track);
    } catch (err) {
      console.log("Skipping track", track);
    }
  }

  console.log("Total PIDs found:", pids.size);

  const result = {};

  for (const pid of pids) {
    const base64 = await fetchMii(pid);
    if (!base64) continue;

    const fc = pidToFc(pid);

    result[fc] = {
      pid,
      render_url:
        "https://mii-unsecure.ariankordi.net/miis/image.png?data=" +
        encodeURIComponent(base64) +
        "&type=all_body_sugar&width=512&shaderType=wiiu_blinn"
    };

    console.log("Added:", fc);
  }

  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/miis.json", JSON.stringify(result, null, 2));

  console.log("Finished building miis.json");
}

build();
