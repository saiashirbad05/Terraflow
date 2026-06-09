const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "data", "logs.json");

// Helper database functions
function readLogs() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify([]));
      return [];
    }
    const rawData = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(rawData || "[]");
  } catch (err) {
    return [];
  }
}

function writeLogs(logs) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(logs, null, 2), "utf-8");
  } catch (err) {
    console.error("Database write error:", err);
  }
}

// Compute statistics dynamically
function calculateStats(logs) {
  let transport = 0;
  let diet = 0;
  let utilities = 0;

  logs.forEach((log) => {
    if (log.category === "transport") transport += log.value;
    if (log.category === "diet") diet += log.value;
    if (log.category === "utilities") utilities += log.value;
  });

  // Keep positive limits
  transport = parseFloat(Math.max(0, transport).toFixed(2));
  diet = parseFloat(Math.max(0, diet).toFixed(2));
  utilities = parseFloat(Math.max(0, utilities).toFixed(2));
  const totalEmissions = parseFloat((transport + diet + utilities).toFixed(2));

  return {
    emissions: { transport, diet, utilities },
    totalEmissions,
  };
}

// Input sanitization function to prevent XSS/injection
function sanitizeInput(input) {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

// GET route to retrieve stats
app.get("/api/logs", (req, res) => {
  const logs = readLogs();
  const stats = calculateStats(logs);
  return res.json({ ...stats, success: true });
});

// POST route to add custom presets logs directly
app.post("/api/logs/add", (req, res) => {
  const { category, value, specific_item, unit } = req.body;
  if (!category || value === undefined) {
    return res.status(400).json({ success: false, error: "Missing required logging parameters" });
  }

  const logs = readLogs();
  logs.push({
    id: `log_${Date.now()}`,
    category,
    value: parseFloat(value),
    specific_item,
    unit,
    timestamp: new Date().toISOString(),
  });

  writeLogs(logs);
  const stats = calculateStats(logs);
  return res.json({ success: true, ...stats });
});

// POST route to log mitigations (nudge acceptances)
app.post("/api/logs/mitigate", (req, res) => {
  const { category, value } = req.body;
  if (!category || value === undefined) {
    return res.status(400).json({ success: false, error: "Missing mitigation parameters" });
  }

  const logs = readLogs();
  logs.push({
    id: `mitigate_${Date.now()}`,
    category,
    value: parseFloat(value), // Expected to be negative
    specific_item: "mitigation_plan",
    unit: "savings",
    timestamp: new Date().toISOString(),
  });

  writeLogs(logs);
  const stats = calculateStats(logs);
  return res.json({ success: true, ...stats });
});

// POST route to reset log database
app.post("/api/logs/reset", (req, res) => {
  writeLogs([]);
  return res.json({ success: true, emissions: { transport: 0, diet: 0, utilities: 0 }, totalEmissions: 0 });
});

// Regex Local Fallback Parser
function localRegexParse(text) {
  const extracted_activities = [];

  const extractNumber = (sentence, keywords) => {
    for (const kw of keywords) {
      const regex = new RegExp(`(\\d+(\\.\\d+)?)\\s*${kw}`);
      const match = sentence.match(regex);
      if (match) {
        const val = parseFloat(match[1]);
        return isNaN(val) ? null : val;
      }
    }
    return null;
  };

  // 1. Parse transport rules
  const transportKeywords = ["miles", "mile", "km", "kilometer", "kilometers", "hour", "hours"];
  const transportValue = extractNumber(text, transportKeywords);
  if (transportValue !== null || text.includes("drove") || text.includes("drive") || text.includes("commute") || text.includes("ride")) {
    let unit = "miles";
    if (text.includes("km") || text.includes("kilometer")) unit = "km";
    
    let item = "standard_gasoline_car";
    if (text.includes("electric") || text.includes("ev")) item = "electric_vehicle";
    if (text.includes("bus") || text.includes("transit")) item = "public_bus";
    if (text.includes("train") || text.includes("subway")) item = "metro_train";
    if (text.includes("flight") || text.includes("fly")) {
      item = "commercial_flight";
      unit = "miles";
    }

    extracted_activities.push({
      category: "transport",
      metric_value: transportValue || 15.0,
      unit: unit,
      specific_item: item,
    });
  }

  // 2. Parse diet rules (Indian context)
  const dietKeywords = ["serving", "servings", "meal", "meals", "curry", "rice", "dal", "paneer", "fish", "chicken", "beef", "roti"];
  const dietValue = extractNumber(text, ["serving", "servings", "plate", "plates", "bowl", "bowls", "meal", "meals"]) || 1;
  if (text.includes("eat") || text.includes("ate") || text.includes("had") || text.includes("dinner") || text.includes("lunch") || text.includes("breakfast") || text.includes("food") || text.includes("rice") || text.includes("curry") || text.includes("paneer") || text.includes("fish") || text.includes("chicken") || text.includes("beef") || text.includes("dal")) {
    let item = "veg_meal";
    if (text.includes("beef")) item = "beef_meal";
    else if (text.includes("fish")) item = "fish_meal";
    else if (text.includes("chicken") || text.includes("tikka")) item = "chicken_meal";
    else if (text.includes("paneer") || text.includes("cheese") || text.includes("dairy")) item = "paneer_dairy";

    extracted_activities.push({
      category: "diet",
      metric_value: dietValue,
      unit: "servings",
      specific_item: item,
    });
  }

  // 3. Parse utilities rules
  const utilityValue = extractNumber(text, ["kwh", "hours", "hour", "percentage", "percent", "min", "minutes", "hr", "hrs"]);
  if (text.includes("power") || text.includes("bill") || text.includes("electricity") || text.includes("heater") || text.includes("ac") || text.includes("air condition") || text.includes("lights")) {
    let item = "grid_electricity";
    if (text.includes("solar") || text.includes("clean")) item = "solar_power";
    if (text.includes("heating") || text.includes("gas")) item = "natural_gas_heating";

    extracted_activities.push({
      category: "utilities",
      metric_value: utilityValue || 10.0,
      unit: "kWh",
      specific_item: item,
    });
  }

  return extracted_activities;
}

// POST endpoint for AI text parsing
app.post("/api/parse-log", async (req, res) => {
  try {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      return res.status(415).json({ parse_successful: false, error: "Content-Type must be application/json" });
    }

    const { raw_text_input } = req.body;

    if (raw_text_input === undefined || raw_text_input === null) {
      return res.status(400).json({ parse_successful: false, error: "Missing raw_text_input parameter" });
    }

    if (typeof raw_text_input !== "string") {
      return res.status(400).json({ parse_successful: false, error: "raw_text_input must be a string value" });
    }

    if (raw_text_input.trim() === "") {
      return res.status(400).json({ parse_successful: false, error: "raw_text_input cannot be empty" });
    }

    if (raw_text_input.length > 500) {
      return res.status(413).json({ parse_successful: false, error: "Payload exceeds maximum length limit of 500 characters" });
    }

    const sanitizedText = sanitizeInput(raw_text_input);
    const text = sanitizedText.toLowerCase();

    // Simplified parsing: use lightweight local regex parser (no external API, minimal tokens)
    const extracted_activities = localRegexParse(text);

    // Process and save extracted activities to logs database
    const logs = readLogs();
    extracted_activities.forEach((act) => {
      let coefficient = 1.0;
      if (act.category === "transport") {
        coefficient = act.specific_item === "electric_vehicle" ? 0.12 : 0.41;
        if (act.specific_item === "public_bus") coefficient = 0.15;
        if (act.specific_item === "metro_train") coefficient = 0.08;
        if (act.specific_item === "commercial_flight") coefficient = 0.24;
      } else if (act.category === "diet") {
        coefficient = act.specific_item === "beef_meal" ? 4.2 : 0.3;
        if (act.specific_item === "chicken_meal") coefficient = 1.1;
        if (act.specific_item === "fish_meal") coefficient = 1.3;
        if (act.specific_item === "paneer_dairy") coefficient = 1.8;
      } else if (act.category === "utilities") {
        coefficient = act.specific_item === "solar_power" ? 0.05 : 0.52;
        if (act.specific_item === "natural_gas_heating") coefficient = 0.38;
      }
      const totalImpact = parseFloat((act.metric_value * coefficient).toFixed(2));
      
      logs.push({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        category: act.category,
        value: totalImpact,
        specific_item: act.specific_item,
        unit: act.unit || "units",
        timestamp: new Date().toISOString(),
      });
    });

    writeLogs(logs);
    const updatedStats = calculateStats(logs);

    return res.json({
      transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      parse_successful: extracted_activities.length > 0,
      extracted_activities,
      ...updatedStats
    });
  } catch (error) {
    return res.status(500).json({ parse_successful: false, error: "Internal processing error occurred" });
  }
});

// POST endpoint for auth
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: "Missing identity token parameter" });
    }

    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!response.ok) {
      return res.status(401).json({ success: false, error: "Invalid identity token signature" });
    }

    const payload = await response.json();
    const targetClientId = process.env.GOOGLE_CLIENT_ID;
    if (!targetClientId) {
      return res.status(500).json({ success: false, error: "Server configuration error: GOOGLE_CLIENT_ID not set" });
    }
    if (payload.aud !== targetClientId) {
      return res.status(403).json({ success: false, error: "Client ID audience mismatch" });
    }

    return res.json({
      success: true,
      user: {
        name: payload.name,
        email: payload.email,
        image: payload.picture,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Authentication validation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 TerraFlow Standalone Backend running on port ${PORT}`);
});
