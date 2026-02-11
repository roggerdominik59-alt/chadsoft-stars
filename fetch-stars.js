const fs = require("fs");

async function updateStars() {
  const response = await fetch("https://chadsoft.co.uk/time-trials/players/3F/FF48F12DC77C5E.html", {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const html = await response.text();

  function extract(label) {
    const regex = new RegExp(label + "\\s*(\\d+)\\s*/\\s*250", "i");
    const match = html.match(regex);
    return match ? parseInt(match[1]) : 0;
  }

  const bronze = extract("Bronze");
  const silver = extract("Silver");
  const gold = extract("Gold");

  const data = {
    bronze,
    silver,
    gold,
    updated: new Date().toISOString()
  };

  fs.writeFileSync("stars.json", JSON.stringify(data, null, 2));
  console.log("Stars updated:", data);
}

updateStars();
