const db = require("../config/db");

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

    const client = await db.pool.connect(); // Get a client from the pool
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
      client.release(); // Release the client back to the pool
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

exports.getAllStreets = async (req, res) => {
  // Check for a query parameter to bypass pagination
  if (req.query.all === "true") {
    try {
      const { rows } = await db.query(
        "SELECT * FROM streets ORDER BY name ASC"
      );
      return res.json({ streets: rows }); // Return in a consistent format
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // Existing pagination logic for the admin panel
  const { page = 1, limit = 15 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const totalResult = await db.query("SELECT COUNT(*) FROM streets");
    const totalStreets = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalStreets / limit);

    const streetsResult = await db.query(
      "SELECT * FROM streets ORDER BY name ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json({
      streets: streetsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalStreets,
      },
    });
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
