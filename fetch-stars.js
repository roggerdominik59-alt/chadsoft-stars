import fetch from "node-fetch";
import fs from "fs";

const URL =
  "https://chadsoft.co.uk/time-trials/players/3F/FF48F12DC77C5E.html";

async function run() {
  const res = await fetch(URL);
  const html = await res.text();

  const text = html.replace(/\s+/g, " ");

  const bronze = text.match(/Bronze:\s*(\d+)/)?.[1] ?? "0";
  const silver = text.match(/Silver:\s*(\d+)/)?.[1] ?? "0";
  const gold   = text.match(/Gold:\s*(\d+)/)?.[1] ?? "0";

  const data = {
    bronze: Number(bronze),
    silver: Number(silver),
    gold: Number(gold),
    max: 250,
    updated: new Date().toISOString()
  };

  fs.writeFileSync("stars.json", JSON.stringify(data, null, 2));
  console.log("Stars updated:", data);
}

run();
