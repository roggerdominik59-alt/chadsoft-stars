const https = require("https");
const fs = require("fs");

const url = "https://chadsoft.co.uk/time-trials/players/34/8FDE9288B138C7.html";

https.get(url, (res) => {
  let data = "";

  res.on("data", chunk => {
    data += chunk;
  });

  res.on("end", () => {

    try {
      // Adjust these regexes if needed depending on page structure
      const bronzeMatch = data.match(/Bronze[^0-9]*([0-9]+)/i);
      const silverMatch = data.match(/Silver[^0-9]*([0-9]+)/i);
      const goldMatch   = data.match(/Gold[^0-9]*([0-9]+)/i);

      const stars = {
        bronze: bronzeMatch ? bronzeMatch[1] : 0,
        silver: silverMatch ? silverMatch[1] : 0,
        gold: goldMatch ? goldMatch[1] : 0
      };

      fs.writeFileSync("tin-stars.json", JSON.stringify(stars, null, 2));

      console.log("Updated tin-stars.json:", stars);

    } catch (err) {
      console.error("Error parsing page:", err);
    }

  });

}).on("error", (err) => {
  console.error("Request failed:", err);
});
