const fs = require("fs");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const cheerio = require("cheerio");

const URL =
  "https://chadsoft.co.uk/time-trials/players/3F/FF48F12DC77C5E.html";

(async () => {
  try {
    const res = await fetch(URL);
    const html = await res.text();
    const $ = cheerio.load(html);

    let bronze = 0;
    let silver = 0;
    let gold = 0;

    $("tr").each((_, row) => {
      const text = $(row).text().toLowerCase();
      const value = parseInt($(row).find("td").last().text(), 10);

      if (text.includes("bronze")) bronze = value;
      if (text.includes("silver")) silver = value;
      if (text.includes("gold")) gold = value;
    });

    const data = {
      bronze,
      silver,
      gold,
      updated: new Date().toISOString(),
    };

    fs.writeFileSync("stars.json", JSON.stringify(data, null, 2));
    console.log("✅ stars.json updated:", data);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
