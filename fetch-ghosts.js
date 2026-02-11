const https = require("https");
const fs = require("fs");

const PLAYER_ID = "3FFF48F12DC77C5E"; // your player id
const URL = `https://tt.chadsoft.co.uk/players/${PLAYER_ID.substring(0,2)}/${PLAYER_ID}.json`;

https.get(URL, (res) => {
    let data = "";

    res.on("data", chunk => {
        data += chunk;
    });

    res.on("end", () => {
        try {
            // Remove BOM if present
            data = data.replace(/^\uFEFF/, "");

            const json = JSON.parse(data);

            if (!json.ghosts || json.ghosts.length === 0) {
                console.log("No ghosts found.");
                fs.writeFileSync("ghosts.json", "[]");
                return;
            }

            const bestPerTrack = {};

            json.ghosts.forEach(ghost => {
                const track = ghost.trackName;

                // Always compare by numeric finishTime
                const time = parseFloat(ghost.finishTime);

                if (!bestPerTrack[track] || time < bestPerTrack[track].time) {
                    bestPerTrack[track] = {
                        track: track,
                        time: ghost.finishTimeSimple,
                        date: ghost.dateSet.split("T")[0],
                        download: "https://tt.chadsoft.co.uk" + ghost.href,
                        timeRaw: time
                    };
                }
            });

            const result = Object.values(bestPerTrack)
                .sort((a, b) => a.track.localeCompare(b.track))
                .map(g => ({
                    track: g.track,
                    time: g.time,
                    date: g.date,
                    download: g.download
                }));

            fs.writeFileSync("ghosts.json", JSON.stringify(result, null, 2));
            console.log("Saved", result.length, "best ghosts.");

        } catch (err) {
            console.error("JSON parse error:", err);
            console.log(data.substring(0, 200));
        }
    });

}).on("error", err => {
    console.error("Request error:", err);
});
