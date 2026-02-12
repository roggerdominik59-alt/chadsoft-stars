const fs = require("fs");

function fcToPid(fc) {
    const clean = fc.replace(/-/g, "");
    const big = BigInt(clean);
    return Number((big >> 32n) & 0xffffffffn);
}

// Example FC list (later this can be dynamic)
const friendCodes = [
    "2067-6146-8941"
];

let result = {};

friendCodes.forEach(fc => {
    const pid = fcToPid(fc);

    result[fc] = {
        pid: pid,
        mii_full_body:
            "https://mii-unsecure.ariankordi.net/miis/image.png?pid=" +
            pid +
            "&type=all_body_sugar&width=512&shaderType=wiiu_blinn"
    };
});

fs.writeFileSync("data/miis.json", JSON.stringify(result, null, 2));

console.log("miis.json generated.");
