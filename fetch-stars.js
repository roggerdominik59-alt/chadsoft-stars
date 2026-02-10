const fs = require("fs");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const URL =
  "https://chadsoft.co.uk/time-trials/players/3F/FF48F12DC77C5E.html";

(async () => {
  try {
    const res = await fetch(URL);
    const html = await res.text();

    // VERY simple & safe matching
    const bronze = (html.match(/Bronze Stars[^0-9]*([0-9]+)/i) || [])[1] || 0;
    const silver = (html.match(/Silver Stars[^0-9]*([0-9]+)/i) || [])[1] || 0;
    const gold = (html.match(/Gold Stars[^0-9]*([0-9]+)/i) || [])[1] || 0;

    const data = {
      bronze: Number(bronze),
      silver: Number(silver),
      gold: Number(gold),
      updated: new Date().toISOString(),
    };

    fs.writeFileSync("stars.json", JSON.stringify(data, null, 2));

    console.log("✅ stars.json updated:", data);
  } catch (err) {
    console.error("❌ Failed to fetch stars:", err);
    process.exit(1);
  }
})();
