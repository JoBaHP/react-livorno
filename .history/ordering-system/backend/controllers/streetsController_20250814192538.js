const db = require("../config/db");

const transliterate = (text) => {
  const cyrillicMap = {
    А: "A",
    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Ђ: "Dj",
    Е: "E",
    Ж: "Z",
    З: "Z",
    И: "I",
    Ј: "J",
    К: "K",
    Л: "L",
    Љ: "Lj",
    М: "M",
    Н: "N",
    Њ: "Nj",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    Ћ: "C",
    У: "U",
    Ф: "F",
    Х: "H",
    Ц: "C",
    Ч: "C",
    Џ: "Dz",
    Ш: "S",
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    ђ: "dj",
    е: "e",
    ж: "z",
    з: "z",
    и: "i",
    ј: "j",
    к: "k",
    л: "l",
    љ: "lj",
    м: "m",
    н: "n",
    њ: "nj",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    ћ: "c",
    у: "u",
    ф: "f",
    х: "h",
    ц: "c",
    ч: "c",
    џ: "dz",
    ш: "s",
  };
  return text
    .split("")
    .map((char) => cyrillicMap[char] || char)
    .join("");
};

exports.searchStreets = async (req, res) => {
  const { term } = req.query;
  if (!term || term.length < 2) {
    return res.json([]);
  }
  try {
    const query =
      "SELECT * FROM streets WHERE name_normalized ILIKE unaccent($1) ORDER BY name ASC LIMIT 10";
    const params = [`%${term}%`];
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Street search error:", err);
    res.status(500).json({ message: "Server error during street search" });
  }
};

exports.populateStreetsFromCity = async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ message: "City name is required." });
  }
  try {
    const cityResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        city
      )}`,
      {
        headers: {
          "User-Agent": "LivornoRistorante/1.0 (contact@livornoristorante.com)",
        },
      }
    );
    if (!cityResponse.ok)
      throw new Error(
        `Nominatim API responded with status: ${cityResponse.status}`
      );
    const cityData = await cityResponse.json();
    if (!cityData || cityData.length === 0)
      return res.status(404).json({ message: `City "${city}" not found.` });

    const bbox = cityData[0].boundingbox;
    const overpassQuery = `[out:json];(way["highway"]["name"](poly:"${bbox[0]} ${bbox[2]} ${bbox[0]} ${bbox[3]} ${bbox[1]} ${bbox[3]} ${bbox[1]} ${bbox[2]}"););out;`;
    const streetsResponse = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        overpassQuery
      )}`
    );
    if (!streetsResponse.ok)
      throw new Error(
        `Overpass API responded with status: ${streetsResponse.status}`
      );
    const streetsData = await streetsResponse.json();

    const streetNames = new Set();
    streetsData.elements.forEach((element) => {
      if (
        element.tags &&
        element.tags.name &&
        element.tags.name.trim() !== ""
      ) {
        streetNames.add(element.tags.name.trim());
      }
    });

    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      for (const name of streetNames) {
        // --- FIX ---
        // Transliterate the name to Latin before passing it to unaccent for normalization.
        const normalizedName = transliterate(name);
        await client.query(
          "INSERT INTO streets (name, name_normalized) VALUES ($1, unaccent($2)) ON CONFLICT (name) DO NOTHING",
          [name, normalizedName]
        );
      }
      await client.query("COMMIT");
    } catch (dbErr) {
      await client.query("ROLLBACK");
      throw dbErr;
    } finally {
      client.release();
    }
    res.status(200).json({
      message: `${streetNames.size} streets have been processed for ${city}.`,
    });
  } catch (err) {
    console.error("Error populating streets:", err);
    res.status(500).json({
      message: err.message || "Server error while populating streets.",
    });
  }
};

exports.createStreet = async (req, res) => {
  const { name } = req.body;
  try {
    // --- FIX ---
    // Also transliterate and normalize manually added streets.
    const normalizedName = transliterate(name);
    const { rows } = await db.query(
      "INSERT INTO streets (name, name_normalized) VALUES ($1, unaccent($2)) RETURNING *",
      [name, normalizedName]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteStreet = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM streets WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
