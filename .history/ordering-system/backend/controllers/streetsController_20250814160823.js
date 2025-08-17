const db = require("../config/db");

exports.getAllStreets = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM streets ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createStreet = async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO streets (name) VALUES ($1) RETURNING *",
      [name]
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

exports.populateStreetsFromCity = async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).json({ message: "City name is required." });
  }

  try {
    // 1. Get the bounding box for the city from Nominatim
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
    if (!cityResponse.ok) {
      throw new Error(
        `Failed to find city. Nominatim API responded with status: ${cityResponse.status}`
      );
    }
    const cityData = await cityResponse.json();
    if (!cityData || cityData.length === 0) {
      return res.status(404).json({ message: `City "${city}" not found.` });
    }
    const bbox = cityData[0].boundingbox;

    // 2. Fetch all roads within that bounding box from Overpass API
    const overpassQuery = `[out:json];(way["highway"]["name"](poly:"${bbox[0]} ${bbox[2]} ${bbox[0]} ${bbox[3]} ${bbox[1]} ${bbox[3]} ${bbox[1]} ${bbox[2]}"););out;`;
    const streetsResponse = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        overpassQuery
      )}`
    );
    if (!streetsResponse.ok) {
      throw new Error(
        `Failed to fetch streets. Overpass API responded with status: ${streetsResponse.status}`
      );
    }
    const streetsData = await streetsResponse.json();

    const streetNames = new Set();
    streetsData.elements.forEach((element) => {
      if (element.tags && element.tags.name) {
        streetNames.add(element.tags.name);
      }
    });

    // 3. Insert new streets into the database
    const client = await db.getClient();
    try {
      await client.query("BEGIN");
      for (const name of streetNames) {
        await client.query(
          "INSERT INTO streets (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
          [name]
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
