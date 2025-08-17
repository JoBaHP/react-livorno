const db = require("../config/db");

exports.getAllZones = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM delivery_zones ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createZone = async (req, res) => {
  const { name, center_lat, center_lng, radius_meters, delivery_fee } =
    req.body;
  try {
    const { rows } = await db.query(
      "INSERT INTO delivery_zones (name, center_lat, center_lng, radius_meters, delivery_fee) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, center_lat, center_lng, radius_meters, delivery_fee]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateZone = async (req, res) => {
  const { id } = req.params;
  const { name, center_lat, center_lng, radius_meters, delivery_fee } =
    req.body;
  try {
    const { rows } = await db.query(
      "UPDATE delivery_zones SET name = $1, center_lat = $2, center_lng = $3, radius_meters = $4, delivery_fee = $5 WHERE id = $6 RETURNING *",
      [name, center_lat, center_lng, radius_meters, delivery_fee, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteZone = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM delivery_zones WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
