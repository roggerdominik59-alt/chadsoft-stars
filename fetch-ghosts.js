const https = require("https");
const fs = require("fs");

const PLAYER_ID = "3FFF48F12DC77C5E"; // your player id
const API_URL = `https://chadsoft.co.uk/players/${PLAYER_ID}.json`;

https.get(API_URL, (res) => {
  let data = "";

  res.on("data", chunk => data += chunk);

  res.on("end", () => {
    try {
      // Remove invisible BOM if present
      data = data.replace(/^\uFEFF/, "");

      const json = JSON.parse(data);

      if (!json.ghosts || json.ghosts.length === 0) {
        console.log("No ghosts found.");
        return;
      }

      // Keep only fastest ghost per track
      const bestGhosts = json.ghosts.filter(g => g.playersFastest === true);

      const output = bestGhosts.map(g => ({
        track: g.trackName,
        time: g.finishTimeSimple,
        date: g.dateSet.split("T")[0],
        download: "https://chadsoft.co.uk" + g.href
      }));

      fs.writeFileSync("ghosts.json", JSON.stringify(output, null, 2));

      console.log("Saved", output.length, "best ghosts.");
    } catch (err) {
      console.error("Parse error:", err);
    }
  });

}).on("error", err => {
  console.error("Request error:", err);
});
