import data from"./backup.json" assert { type: "json" };

function generateSQL(
    urlLong,
    urlQrCode,
    urlShort,
    urlShortFull
) {
    const { hostname } = new URL(urlLong);

    // urlLong could contain single quotes which need to get escaped the sql way 
    const urlLongEscaped = urlLong.replace("'", "''");

    return "INSERT INTO public.\"Urls\" (\"urlLong\",\"urlQrCode\",\"urlShort\",\"urlShortFull\",\"hostname\") VALUES ('" + urlLongEscaped + "','" + urlQrCode + "','" + urlShort + "','" + urlShortFull + "','" + hostname + "');\n";

}

const arr = [];

data.forEach(URL => {

    const query = generateSQL(
        URL.urlLong,
        URL.urlQrCode,
        URL.urlShort,
        URL.urlShortFull
    );

    arr.push(query);

});

const queryBig = arr.join("");

import * as fs from "fs";

try {
    fs.writeFileSync("backup.sql", queryBig);
    // file written successfully
} catch (err) {
    console.error(err);
}
