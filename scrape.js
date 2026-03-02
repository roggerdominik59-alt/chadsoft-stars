const fs = require("fs");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

/* ===== PLAYERS ===== */
const players = [
  {
    name: "dom",
    url: "https://chadsoft.co.uk/time-trials/players/3F/FF48F12DC77C5E.html"
  },
  {
    name: "tin",
    url: "https://chadsoft.co.uk/time-trials/players/34/8FDE9288B138C7.html"
  },
  {
    name: "soap",
    url: "https://chadsoft.co.uk/time-trials/rkgd/4E/86/99E727A2266B627FB33184AE121C49FC531E.html"
  }
];

/* ===== SCRAPER ===== */
async function scrapePlayer(player) {
  try {
    console.log("Scraping:", player.name);

    const res = await fetch(player.url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    let bronze = 0;
    let silver = 0;
    let gold = 0;

    $(".medal").each((i, el) => {
      const medal = $(el).attr("title") || "";

      if (medal.includes("Bronze")) bronze++;
      if (medal.includes("Silver")) silver++;
      if (medal.includes("Gold")) gold++;
    });

    const data = { bronze, silver, gold };

    fs.writeFileSync(
      `${player.name}-stars.json`,
      JSON.stringify(data, null, 2)
    );

    console.log(`${player.name} updated`, data);

  } catch (err) {
    console.error("Error scraping", player.name, err);
  }
}

/* ===== RUN ALL ===== */
async function run() {
  for (const player of players) {
    await scrapePlayer(player);
  }
}

run();
