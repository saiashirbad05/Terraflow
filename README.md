# TerraFlow: Personal Carbon Insights Engine

TerraFlow is a smart, dynamic sustainability dashboard designed to help everyday users track, understand, and reduce their daily carbon footprint. The application translates everyday activities (transit, diet, utilities) into tangible environmental telemetry with real-time feedback and behavioral recommendations.

---

## 1. Vertical & Use Case Persona
- **Chosen Vertical**: Sustainability & Climate Action
- **Target Audience**: Everyday non-technical users seeking to manage their carbon footprint without complex math or tedious questionnaires.
- **Design Philosophy**: Warm neutrals, sleek pastel boundaries, crisp typography, and zero-clutter. It is built to feel inviting and accessible.

---

## 2. Reorganized Split Architecture

The codebase is split cleanly into frontend client and backend API environments, facilitating separate deployment, scaling, and maintenance.

```
terraflow-platform/
├── backend/                  # Standalone API Parser Service (Port 3001)
│   ├── server.js             # Express application & extraction algorithms
│   └── package.json          # Node dependencies (Express, CORS)
│
├── frontend/                 # Client UI Engine (Port 3000)
│   ├── src/
│   │   ├── app/              # Dashboard columns & page views
│   │   └── context/          # Client state pipeline (CarbonContext)
│   ├── next.config.ts        # Next.js configurations & API proxy rewrites
│   └── package.json          # Next.js & UI dependencies
│
└── tests/                    # Integration Test Suite
    └── api-test.js           # 10 comprehensive assertion test cases
```

---

## 3. How the Solution Works

### A. Intelligent Parser Engine (Backend)
The Express backend provides a `POST /api/parse-log` endpoint. When a user inputs natural description language or triggers presets, the backend:
1. **Header Validation**: Verifies headers include `Content-Type: application/json`.
2. **Payload Protection**: Rejects payloads exceeding **500 characters** to prevent Buffer/DoS resource abuse.
3. **Input Sanitization**: Filters and escapes HTML tags to block Cross-Site Scripting (XSS) script injections.
4. **Keyword Extraction**: Employs flexible regex patterns to capture numbers preceding consumption categories (e.g. miles, kwh, servings) and classifies them into:
   - **Transport**: Standard Car, EV, Public Bus, Metro, and Flights.
   - **Diet**: Beef burgers, Chicken, Dairy, and Plant-based meals.
   - **Utilities**: Grid electricity, Solar power, and Natural gas heating.

### B. Client UX Flow (Frontend)
- **Zero-Telemetry Blank State**: On first load, all dashboard metrics start at zero. To reduce user confusion, complex charts and graphs are hidden. Instead, a clean placeholder guides the user to input their first log.
- **Dynamic Infographics**: Logging an activity immediately renders the Recharts Bar Charts, Circular Quota Gauges, regional rank comparisons, and achievements.
- **UX Logic Integration**:
  - Clicking **"+ Add to Plan"** on suggestions (nudges) immediately updates client state, subtracts carbon emissions from the user's daily load, and removes the suggestion.
  - Users can dynamically update their **Weekly Carbon Budget Quota** to scale their target goals, recalculating percent-utilization dynamically.
  - Includes a simulator sandbox on the landing page to preview multipliers.
- **Repeated Scroll Animations**: Scroll animations trigger every time elements enter the viewport to maintain a dynamic, polished feel.

---

## 4. Security Focus Areas
- **XSS Protections**: Deep escapes on input parameters before processing.
- **Strict Validations**: Empty/whitespace parameters yield `400 Bad Request`.
- **DoS Safeguard**: Rigid length validation gates.
- **Credential Safety**: Google OAuth mock interfaces keep operations sandboxed.

---

## 5. Testing & Validation
We have a local integration test suite executing 10 validation scenarios:
- **Transport & Diet keyword checks**
- **Strict headers checking (Content-Type validator)**
- **XSS payload sanitization checks**
- **Whitespace & empty string rejections**
- **Multi-category paragraph extraction validation**

To run the test suite, start the backend server and run:
```bash
node tests/api-test.js
```
All **10/10 tests pass successfully**.
