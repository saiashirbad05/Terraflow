const assert = require("assert");

async function runTests() {
  console.log("🚀 Starting TerraFlow Platform API Integration Tests...");
  const baseUrl = "http://localhost:3001";
  let testsPassed = 0;
  let totalTests = 0;

  const testCases = [
    {
      name: "Transport Log Parsing",
      payload: { raw_text_input: "I drove 25 miles in my electric car" },
      validator: (data) => {
        assert.strictEqual(data.parse_successful, true);
        const transport = data.extracted_activities.find(a => a.category === "transport");
        assert.ok(transport, "Should extract transport category");
        assert.strictEqual(transport.metric_value, 25);
        assert.strictEqual(transport.unit, "miles");
        assert.strictEqual(transport.specific_item, "electric_vehicle");
      }
    },
    {
      name: "Diet Log Parsing",
      payload: { raw_text_input: "Had a beef curry for lunch" },
      validator: (data) => {
        assert.strictEqual(data.parse_successful, true);
        const diet = data.extracted_activities.find(a => a.category === "diet");
        assert.ok(diet, "Should extract diet category");
        assert.strictEqual(diet.specific_item, "beef_meal");
      }
    },
    {
      name: "Utilities Log Parsing",
      payload: { raw_text_input: "Home electricity usage was 12 kwh" },
      validator: (data) => {
        assert.strictEqual(data.parse_successful, true);
        const utils = data.extracted_activities.find(a => a.category === "utilities");
        assert.ok(utils, "Should extract utilities category");
        assert.strictEqual(utils.metric_value, 12);
        assert.strictEqual(utils.unit, "kWh");
      }
    },
    {
      name: "Invalid Input Validation (Empty)",
      payload: { raw_text_input: "" },
      validator: (data, status) => {
        assert.strictEqual(status, 400);
        assert.strictEqual(data.parse_successful, false);
      }
    },
    {
      name: "Invalid Input Validation (Whitespace)",
      payload: { raw_text_input: "    " },
      validator: (data, status) => {
        assert.strictEqual(status, 400);
        assert.strictEqual(data.parse_successful, false);
      }
    },
    {
      name: "Security Payload Limit Check (>500 chars)",
      payload: { raw_text_input: "a".repeat(501) },
      validator: (data, status) => {
        assert.strictEqual(status, 413);
        assert.strictEqual(data.parse_successful, false);
      }
    },
    {
      name: "Security Input Sanitization (XSS check)",
      payload: { raw_text_input: "<script>alert('xss')</script> I drove 10 miles" },
      validator: (data) => {
        assert.strictEqual(data.parse_successful, true);
        const transport = data.extracted_activities.find(a => a.category === "transport");
        assert.ok(transport, "Should parse despite injection attempt");
        // Ensure scripts are sanitized
        assert.ok(!data.extracted_activities.some(a => JSON.stringify(a).includes("<script>")), "Scripts must be escaped");
      }
    },
    {
      name: "Flight Transport Parsing",
      payload: { raw_text_input: "Took a commercial flight for 400 miles" },
      validator: (data) => {
        assert.strictEqual(data.parse_successful, true);
        const transport = data.extracted_activities.find(a => a.category === "transport");
        assert.ok(transport);
        assert.strictEqual(transport.specific_item, "commercial_flight");
        assert.strictEqual(transport.metric_value, 400);
      }
    },
    {
      name: "Multi-category Parsing Check",
      payload: { raw_text_input: "Today I drove 12 miles and had a beef curry" },
      validator: (data) => {
        assert.strictEqual(data.parse_successful, true);
        const transport = data.extracted_activities.find(a => a.category === "transport");
        const diet = data.extracted_activities.find(a => a.category === "diet");
        assert.ok(transport, "Should extract transport");
        assert.ok(diet, "Should extract diet");
        assert.strictEqual(transport.metric_value, 12);
        assert.strictEqual(diet.specific_item, "beef_meal");
      }
    },
    {
      name: "Wrong Content-Type Handler Check",
      payload: "plain_text_not_json",
      customHeaders: { "Content-Type": "text/plain" },
      validator: (data, status) => {
        assert.strictEqual(status, 415);
        assert.strictEqual(data.parse_successful, false);
      }
    }
  ];

  for (const tc of testCases) {
    totalTests++;
    console.log(`\nRunning: ${tc.name}...`);
    try {
      const headers = tc.customHeaders || { "Content-Type": "application/json" };
      const body = typeof tc.payload === "string" ? tc.payload : JSON.stringify(tc.payload);

      const response = await fetch(`${baseUrl}/api/parse-log`, {
        method: "POST",
        headers,
        body
      });

      const data = await response.json();
      tc.validator(data, response.status);
      console.log(`✅ Passed: ${tc.name}`);
      testsPassed++;
    } catch (err) {
      console.error(`❌ Failed: ${tc.name}`);
      console.error(err);
    }
  }

  console.log(`\n==================================================`);
  console.log(`Test Execution Summary: ${testsPassed}/${totalTests} Tests Passed.`);
  console.log(`==================================================`);

  if (testsPassed !== totalTests) {
    process.exit(1);
  }
}

runTests();
