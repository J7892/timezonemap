# 🇨🇦 Canada Time Zone Map & Live Dashboard

An interactive, real-time Canadian Time Zone Map and Dashboard designed for the **November 2026 Daylight Saving Transition**.

With several provinces abolishing the biannual switch to remain on permanent daylight time while other provinces continue to fall back—and with notable sub-provincial splits—this dashboard provides a live, authoritative visual map of effective wall-clock times, UTC offsets, and statutory time policies across all Canadian jurisdictions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tests](https://img.shields.io/badge/tests-72%2F72%20passing-brightgreen.svg)
![Data](https://img.shields.io/badge/data-GeoJSON%20%7C%20TopoJSON-orange.svg)

---

## 🗺️ Key Features

- **23 Sub-Provincial Jurisdictions**:
  Accurately maps the complex internal boundaries that do not follow simple provincial borders, including:
  - **Northwestern Ontario (`CA-ON-NW`)**: Kenora, Dryden, Fort Frances, and Sioux Lookout remain on permanent Central Daylight Time (UTC−5) in parity with Manitoba.
  - **Atikokan & Pickle Lake (`CA-ON-ATIKOKAN`)**: Year-round Eastern Standard Time (UTC−5, no DST).
  - **Southern & Eastern Ontario (`CA-ON-SOUTH`)**: Seasonal Eastern Time (falls back on Nov 1 from EDT UTC−4 to EST UTC−5).
  - **Quebec Main (`CA-QC-MAIN`) vs Blanc-Sablon (`CA-QC-BLANC-SABLON`)**: Most of Quebec falls back to EST, while the Lower North Shore / Blanc-Sablon remains on year-round AST (UTC−4).
  - **British Columbia**: Pacific BC on permanent PDT (UTC−7), Peace River and Creston on year-round MST (UTC−7), and East Kootenay aligning with Alberta (UTC−6).
  - **Alberta (`CA-AB`) & Saskatchewan (`CA-SK`)**: Both effectively share UTC−6 year-round.
  - **Manitoba (`CA-MB`)**: Permanent Central Daylight Time (UTC−5).
  - **Nunavut**: Kitikmeot (UTC−6 $\rightarrow$ UTC−7), Kivalliq (UTC−5 $\rightarrow$ UTC−6), Qikiqtaaluk (UTC−4 $\rightarrow$ UTC−5), and Coral Harbour / Southampton Island (year-round EST UTC−5).
  - **Atlantic Canada & Newfoundland**: Maritime provinces and Labrador on Atlantic Time; Island of Newfoundland on half-hour Newfoundland Time (UTC−2:30 $\rightarrow$ UTC−3:30).

- **⏱️ Time-Travel Transition Simulator**:
  Drag the timeline slider or use presets (**Live**, **Oct 31**, **Nov 1 Switch Moment**, **Nov 2 Winter**) to preview how clocks and colors shift across Canada dynamically.

- **🔍 Quick City Search & Pin**:
  Search 90+ Canadian municipalities to instantly fly to their location on the map, drop a pin, and view their local wall-clock time and timezone status.

- **⚡ Deterministic Time Engine**:
  Independent of browser OS `tzdata` update lag. Employs statutory calculation rules and tested edge cases with 72 unit tests.

- **🌐 Zero Heavy Dependencies**:
  Built with clean modern ES Modules, responsive CSS, and Leaflet vector rendering. Runs locally or deployed to GitHub Pages without server-side rendering or build steps.

---

## 🚀 Quick Start

### 1. Run Locally

You can serve the dashboard with any static web server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve .
```

Open `http://localhost:8080` in your web browser.

### 2. Run the Test Suite

```bash
node tests/testTimeEngine.js
```

All 72 tests validate pre-switch, post-switch, and second-by-second transition moments across all zones.

### 3. Rebuild Boundary Datasets

If upstream OpenStreetMap or Statistics Canada boundaries are updated:

```bash
python3 scripts/build_canada_timezones.py
```

This updates `data/canada_timezones.geojson` and `data/canada_timezones.topojson`.

---

## 📁 Repository Structure

```
timezonemap/
├── index.html                   # Main dashboard application
├── package.json                 # Scripts and package metadata
├── data/
│   ├── canada_timezones.geojson # 23-region boundary dataset
│   ├── canada_timezones.topojson# Lightweight TopoJSON dataset
│   └── canada_cities.json       # 91 Canadian cities with coordinates
├── src/
│   ├── dashboard.js             # UI controller, map integration, simulator
│   ├── timeEngine.js            # Core time calculation and formatting
│   ├── timezoneRules.js         # Statutory 2026 rules and transition moments
│   └── styles.css               # Modern dark-mode dashboard styling
├── scripts/
│   └── build_canada_timezones.py# Data pipeline script
├── tests/
│   └── testTimeEngine.js        # 72 unit tests
└── vendor/
    └── leaflet/                 # Self-contained Leaflet library assets
```

---

## 📜 Statutory Policies Summary (November 2026)

| Region | Primary Zone | Oct 2026 (Before) | Nov 2026 (After) | Seasonal Switch? |
| :--- | :--- | :--- | :--- | :--- |
| **British Columbia (Pacific)** | `America/Vancouver` | UTC−7 (PDT) | UTC−7 (PDT) | ❌ Permanent PDT |
| **Peace River District (BC)** | `America/Dawson_Creek`| UTC−7 (MST) | UTC−7 (MST) | ❌ Year-Round MST |
| **Creston Valley (BC)** | `America/Creston` | UTC−7 (MST) | UTC−7 (MST) | ❌ Year-Round MST |
| **East Kootenay (BC)** | `America/Edmonton` | UTC−6 (MDT) | UTC−6 (MDT) | ❌ Permanent MDT |
| **Alberta** | `America/Edmonton` | UTC−6 (MDT) | UTC−6 (MDT) | ❌ Permanent MDT |
| **Saskatchewan** | `America/Regina` | UTC−6 (CST) | UTC−6 (CST) | ❌ Year-Round CST |
| **Manitoba** | `America/Winnipeg` | UTC−5 (CDT) | UTC−5 (CDT) | ❌ Permanent CDT |
| **NW Ontario (Central)** | `America/Winnipeg` | UTC−5 (CDT) | UTC−5 (CDT) | ❌ Permanent CDT |
| **Atikokan & Pickle Lake (ON)**| `America/Atikokan` | UTC−5 (EST) | UTC−5 (EST) | ❌ Year-Round EST |
| **Southern & Eastern Ontario**| `America/Toronto` | UTC−4 (EDT) | UTC−5 (EST) | ✅ Falls back Nov 1 |
| **Quebec (Main)** | `America/Toronto` | UTC−4 (EDT) | UTC−5 (EST) | ✅ Falls back Nov 1 |
| **Blanc-Sablon (QC)** | `America/Blanc-Sablon`| UTC−4 (AST) | UTC−4 (AST) | ❌ Year-Round AST |
| **New Brunswick** | `America/Moncton` | UTC−3 (ADT) | UTC−4 (AST) | ✅ Falls back Nov 1 |
| **Nova Scotia** | `America/Halifax` | UTC−3 (ADT) | UTC−4 (AST) | ✅ Falls back Nov 1 |
| **Prince Edward Island** | `America/Halifax` | UTC−3 (ADT) | UTC−4 (AST) | ✅ Falls back Nov 1 |
| **Labrador** | `America/Goose_Bay` | UTC−3 (ADT) | UTC−4 (AST) | ✅ Falls back Nov 1 |
| **Newfoundland Island** | `America/St_Johns` | UTC−2:30 (NDT) | UTC−3:30 (NST) | ✅ Falls back Nov 1 |
| **Yukon** | `America/Whitehorse` | UTC−7 (MST) | UTC−7 (MST) | ❌ Permanent UTC−7 |
| **Northwest Territories** | `America/Yellowknife` | UTC−6 (MDT) | UTC−6 (MDT) | ❌ Permanent MDT |
| **Nunavut (Kitikmeot)** | `America/Cambridge_Bay`| UTC−6 (MDT) | UTC−7 (MST) | ✅ Falls back Nov 1 |
| **Nunavut (Kivalliq)** | `America/Rankin_Inlet` | UTC−5 (CDT) | UTC−6 (CST) | ✅ Falls back Nov 1 |
| **Nunavut (Coral Harbour)** | `America/Coral_Harbour`| UTC−5 (EST) | UTC−5 (EST) | ❌ Year-Round EST |
| **Nunavut (Qikiqtaaluk)** | `America/Iqaluit` | UTC−4 (EDT) | UTC−5 (EST) | ✅ Falls back Nov 1 |

---

## 📄 License

MIT License. Open data provided in accordance with Open Government Licence - Canada and OpenStreetMap contributors.
