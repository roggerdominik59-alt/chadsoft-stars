const fs = require("fs");
const cheerio = require("cheerio");

const PLAYER_URL = "https://chadsoft.co.uk/time-trials/players/3F/FF48F12DC77C5E.html";

async function scrape() {
    const res = await fetch(PLAYER_URL);
    const html = await res.text();
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
    console.log("Ghosts updated:", ghosts.length);
}

scrape().catch(err => {
    console.error("Scrape failed:", err);
    process.exit(1);
});
