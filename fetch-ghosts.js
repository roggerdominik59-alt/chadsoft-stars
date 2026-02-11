const https = require("https");
const fs = require("fs");

const PLAYER_ID = "3FFF48F12DC77C5E"; // your player id
const API_URL = `https://tt.chadsoft.co.uk/players/${PLAYER_ID}.json`;

https.get(API_URL, (res) => {
  let data = "";

  res.on("data", chunk => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      // remove possible BOM
      data = data.replace(/^\uFEFF/, "");

      const json = JSON.parse(data);

      if (!json.ghosts) {
        console.log("No ghosts found in response.");
        return;
      }

      const bestPerTrack = {};

      json.ghosts.forEach(ghost => {
        const track = ghost.trackName;

        if (!bestPerTrack[track]) {
          bestPerTrack[track] = ghost;
        } else {
          // compare times
          if (ghost.finishTime < bestPerTrack[track].finishTime) {
            bestPerTrack[track] = ghost;
          }
        }
      });

      const result = Object.values(bestPerTrack).map(g => ({
        track: g.trackName,
        time: g.finishTimeSimple,
        date: g.dateSet.split("T")[0],
        download: `https://tt.chadsoft.co.uk${g.href}`
      }));

      fs.writeFileSync("ghosts.json", JSON.stringify(result, null, 2));

      console.log("Saved", result.length, "best ghosts.");
    } catch (err) {
      console.error("Parse error:", err);
    }
  });

}).on("error", (err) => {
  console.error("Request error:", err);
});
