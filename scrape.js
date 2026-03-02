const fs = require("fs");

const players = [
  {
    name: "dom",
    url: "https://chadsoft.co.uk/time-trials/players/3F/FF48F12DC77C5E.json"
  },
  {
    name: "tin",
    url: "https://chadsoft.co.uk/time-trials/players/34/8FDE9288B138C7.json"
  },
  {
    name: "soap",
    url: "https://chadsoft.co.uk/time-trials/players/0B/925BB435D54BC3.json"
  }
];

async function scrapePlayer(player) {
  console.log("Fetching:", player.name);

  const res = await fetch(player.url);
  const data = await res.json();

  const result = {
    bronze: data.stars?.bronze || 0,
    silver: data.stars?.silver || 0,
    gold: data.stars?.gold || 0
  };

  fs.writeFileSync(
    `${player.name}.json`,
    JSON.stringify(result, null, 2)
  );

  console.log(player.name, result);
}

async function run() {
  for (const player of players) {
    await scrapePlayer(player);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
