const http = require("http");
const fs = require("fs");

const FRIEND_CODE = "2067-6146-8941"; // CHANGE WHEN NEEDED

const fc = FRIEND_CODE.replace(/-/g, "");
const pid = BigInt(fc) & BigInt("0xFFFFFFFF");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://gamespy.net/sake">
  <SOAP-ENV:Body>
    <ns1:SearchForRecords>
      <ns1:gameid>1687</ns1:gameid>
      <ns1:secretKey>9Rmy</ns1:secretKey>
      <ns1:loginTicket>23c715d620f986c22Pwwii</ns1:loginTicket>
      <ns1:tableid>FriendInfo</ns1:tableid>
      <ns1:filter>ownerid=${pid}</ns1:filter>
      <ns1:sort>recordid</ns1:sort>
      <ns1:offset>0</ns1:offset>
      <ns1:max>1</ns1:max>
      <ns1:surrounding>0</ns1:surrounding>
      <ns1:ownerids></ns1:ownerids>
      <ns1:cacheFlag>0</ns1:cacheFlag>
      <ns1:fields>
        <ns1:string>info</ns1:string>
      </ns1:fields>
    </ns1:SearchForRecords>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

const options = {
  hostname: "mariokartwii.sake.gs.wiimmfi.de",
  port: 80,
  path: "/SakeStorageServer/StorageServer.asmx",
  method: "POST",
  headers: {
    "User-Agent": "GameSpyHTTP/1.0",
    "Content-Type": "text/xml",
    "SOAPAction": "http://gamespy.net/sake/SearchForRecords",
    "Content-Length": Buffer.byteLength(xml)
  }
};

const req = http.request(options, res => {
  let data = "";

  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const match = data.match(/<info>(.*?)<\/info>/);

    if (!match) {
      console.log("No Mii found.");
      fs.writeFileSync("mii.json", "{}");
      return;
    }

    const base64 = match[1];

    const miiUrl =
      "https://mii-unsecure.ariankordi.net/miis/image.png?data=" +
      encodeURIComponent(base64) +
      "&shaderType=wiiu_blinn&type=all_body_sugar&width=256";

    fs.writeFileSync(
      "mii.json",
      JSON.stringify({ miiUrl }, null, 2)
    );

    console.log("Mii saved.");
  });
});

req.on("error", err => {
  console.error("Request error:", err);
});

req.write(xml);
req.end();
