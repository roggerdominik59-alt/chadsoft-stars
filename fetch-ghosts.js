const https = require("https");
const fs = require("fs");

const PLAYER_ID = "3FFF48F12DC77C5E"; // your player id

const options = {
  hostname: "tt.chadsoft.co.uk",
  path: `/players/${PLAYER_ID.substring(0, 2)}/${PLAYER_ID}.json`,
  method: "GET",
};

https.get(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      // remove BOM if present
      data = data.replace(/^\uFEFF/, "");

      const json = JSON.parse(data);

      if (!json.ghosts) {
        console.log("No ghosts found.");
        return;
      }

      const bestGhosts = json.ghosts
        .filter(g => g.playersFastest === true)
        .map(g => ({
          track: g.trackName,
          time: g.finishTimeSimple,
          date: g.dateSet,
          download: `https://tt.chadsoft.co.uk${g.href}`
        }));

      fs.writeFileSync("ghosts.json", JSON.stringify(bestGhosts, null, 2));

      console.log("✅ ghosts.json created!");
      console.log(bestGhosts);

    } catch (err) {
      console.error("JSON Parse Error:", err);
    }
  });

}).on("error", (err) => {
  console.error("Request error:", err);
});
