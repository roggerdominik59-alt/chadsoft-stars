const fs = require("fs");
const https = require("https");
const cheerio = require("cheerio");

const PLAYER_URL = "https://chadsoft.co.uk/time-trials/players/3F/FF48F12DC77C5E.html";

function getHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function scrape() {
  const html = await getHTML(PLAYER_URL);
  const $ = cheerio.load(html);

  const ghosts = [];

  $("table tbody tr").each((i, row) => {
    const tds = $(row).find("td");

    const track = $(tds[0]).text().trim();
    const time = $(tds[1]).text().trim();
    const date = $(tds[2]).text().trim();
    const link = $(tds[3]).find("a").attr("href");

    if (track && link) {
      ghosts.push({
        track,
        time,
        date,
        download: "https://chadsoft.co.uk" + link
      });
    }
  });

  fs.writeFileSync("ghosts.json", JSON.stringify(ghosts, null, 2));
  console.log("Updated ghosts:", ghosts.length);
}

scrape().catch(err => {
  console.error(err);
  process.exit(1);
});
