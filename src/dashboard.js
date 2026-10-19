/**
 * dashboard.js
 *
 * Interactive Canadian Time Zone Live Map & Dashboard.
 * Integrates Leaflet vector polygons, live ticking clocks, time-travel simulator,
 * city search, and detailed statutory inspection drawer.
 */

import { getRegionTime, getAllRegionTimes, getOffsetColor } from './timeEngine.js';
import { TIMEZONE_RULES } from './timezoneRules.js';

// Application State
const state = {
  isLive: true,
  currentDate: new Date(),
  use24Hour: false,
  selectedRegionId: 'CA-ON-SOUTH',
  geoJsonData: null,
  geoJsonLayer: null,
  citiesData: [],
  cityMarkersLayer: null,
  selectedCityMarker: null,
  sliderMin: new Date('2026-10-25T00:00:00Z').getTime(),
  sliderMax: new Date('2026-11-10T00:00:00Z').getTime(),
};

// Hub cities to feature in the top horizontal ticker bar
const HUB_CITIES = [
  { name: 'Vancouver', regionId: 'CA-BC-PACIFIC' },
  { name: 'Fort Nelson', regionId: 'CA-BC-FORT-NELSON' },
  { name: 'Dawson Creek', regionId: 'CA-BC-PEACE-RIVER' },
  { name: 'Calgary', regionId: 'CA-AB' },
  { name: 'Lloydminster', regionId: 'CA-SK-LLOYDMINSTER' },
  { name: 'Regina', regionId: 'CA-SK' },
  { name: 'Winnipeg', regionId: 'CA-MB' },
  { name: 'Kenora', regionId: 'CA-ON-NW' },
  { name: 'Toronto', regionId: 'CA-ON-SOUTH' },
  { name: 'Montreal', regionId: 'CA-QC-MAIN' },
  { name: 'Blanc-Sablon', regionId: 'CA-QC-BLANC-SABLON' },
  { name: 'Halifax', regionId: 'CA-NS' },
  { name: 'St. John’s', regionId: 'CA-NL-ISLAND' },
  { name: 'Whitehorse', regionId: 'CA-YT' },
  { name: 'Yellowknife', regionId: 'CA-NT' },
  { name: 'Iqaluit', regionId: 'CA-NU-QIKIQTAALUK' },
];

let map = null;

// Initialize Map
function initMap() {
  map = L.map('map', {
    center: [58.5, -96.0],
    zoom: 4,
    minZoom: 3,
    maxZoom: 9,
    zoomControl: false,
  });

  // Add zoom control to top-left
  L.control.zoom({ position: 'topleft' }).addTo(map);

  // Esri World Dark Gray Base (No API key required, no watermark)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  }).addTo(map);

  // Esri World Dark Gray Reference (Labels & boundaries overlay)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    attribution: '',
    maxZoom: 16,
    opacity: 0.65
  }).addTo(map);

  state.cityMarkersLayer = L.layerGroup().addTo(map);
}

// Polygon Style Helper
function getFeatureStyle(feature) {
  const regionId = feature.id || feature.properties.id;
  const timeInfo = getRegionTime(regionId, state.currentDate);
  const isSelected = state.selectedRegionId === regionId;

  return {
    fillColor: timeInfo.color,
    weight: isSelected ? 3 : 1.2,
    opacity: 1,
    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
    dashArray: isSelected ? '' : '1',
    fillOpacity: isSelected ? 0.8 : 0.62,
  };
}

// Update Map Styles
function updateMapStyles() {
  if (state.geoJsonLayer) {
    state.geoJsonLayer.eachLayer((layer) => {
      layer.setStyle(getFeatureStyle(layer.feature));
      // Refresh tooltip content
      const feature = layer.feature;
      const regionId = feature.id || feature.properties.id;
      const timeInfo = getRegionTime(regionId, state.currentDate);
      const timeStr = state.use24Hour ? timeInfo.wallClock.time24 : timeInfo.wallClock.time12;

      layer.bindTooltip(`
        <div class="tz-tooltip">
          <div class="tz-tooltip-title">${timeInfo.name}</div>
          <div class="tz-tooltip-time">${timeStr} <span style="font-size:0.75rem">(${timeInfo.abbr})</span></div>
          <div class="tz-tooltip-meta">${timeInfo.offsetString} • ${timeInfo.transitionStatus}</div>
        </div>
      `, { sticky: true, opacity: 0.95 });
    });
  }
}

// Load and render GeoJSON
async function loadGeoJson() {
  try {
    const res = await fetch('./data/canada_timezones.geojson');
    state.geoJsonData = await res.json();

    state.geoJsonLayer = L.geoJSON(state.geoJsonData, {
      style: getFeatureStyle,
      onEachFeature: (feature, layer) => {
        const regionId = feature.id || feature.properties.id;

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 2.5,
              color: '#ffffff',
              fillOpacity: 0.85,
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              l.bringToFront();
            }
          },
          mouseout: (e) => {
            if (state.geoJsonLayer) {
              state.geoJsonLayer.resetStyle(e.target);
              // Re-highlight selected
              if (state.selectedRegionId === regionId) {
                e.target.setStyle(getFeatureStyle(feature));
              }
            }
          },
          click: () => {
            selectRegion(regionId);
          }
        });
      }
    }).addTo(map);

    updateMapStyles();
  } catch (err) {
    console.error('Failed to load GeoJSON:', err);
  }
}

// Load Cities Data
async function loadCities() {
  try {
    const res = await fetch('./data/canada_cities.json');
    state.citiesData = await res.json();
    initSearch();
  } catch (err) {
    console.error('Failed to load cities data:', err);
  }
}

// Build Top Hub Strip
function initHubStrip() {
  const container = document.getElementById('hub-strip');
  if (!container) return;

  container.innerHTML = '';
  HUB_CITIES.forEach((hub) => {
    const chip = document.createElement('div');
    chip.className = 'hub-chip';
    chip.id = `hub-chip-${hub.regionId}`;
    chip.addEventListener('click', () => {
      selectRegion(hub.regionId);
    });

    chip.innerHTML = `
      <div class="hub-chip-top">
        <span class="hub-chip-name">${hub.name}</span>
        <span class="hub-chip-abbr" id="hub-abbr-${hub.regionId}">--</span>
      </div>
      <div class="hub-chip-time" id="hub-time-${hub.regionId}">--:--:--</div>
    `;
    container.appendChild(chip);
  });
}

// Update Top Hub Strip Times
function updateHubStrip() {
  HUB_CITIES.forEach((hub) => {
    const timeInfo = getRegionTime(hub.regionId, state.currentDate);
    const chip = document.getElementById(`hub-chip-${hub.regionId}`);
    const timeEl = document.getElementById(`hub-time-${hub.regionId}`);
    const abbrEl = document.getElementById(`hub-abbr-${hub.regionId}`);

    if (chip) chip.style.borderLeftColor = timeInfo.color;
    if (abbrEl) abbrEl.textContent = timeInfo.abbr;
    if (timeEl) {
      timeEl.textContent = state.use24Hour
        ? timeInfo.wallClock.time24
        : timeInfo.wallClock.time12;
    }
  });
}

// Select Region & Open Drawer
export function selectRegion(regionId) {
  state.selectedRegionId = regionId;
  updateMapStyles();
  renderSideDrawer(regionId);
}

// Render Side Drawer
function renderSideDrawer(regionId) {
  const drawer = document.getElementById('side-drawer');
  if (!drawer) return;

  const timeInfo = getRegionTime(regionId, state.currentDate);
  drawer.classList.remove('hidden');

  document.getElementById('drawer-title').textContent = timeInfo.name;
  document.getElementById('drawer-subtitle').textContent = `${timeInfo.province} • ${timeInfo.ianaZone}`;

  const timeStr = state.use24Hour ? timeInfo.wallClock.time24 : timeInfo.wallClock.time12;
  document.getElementById('drawer-clock-time').textContent = timeStr;
  document.getElementById('drawer-clock-date').textContent = timeInfo.wallClock.dateFull;

  const badgeEl = document.getElementById('drawer-badge-permanent');
  if (timeInfo.isPermanent) {
    badgeEl.className = 'pill-badge permanent';
    badgeEl.textContent = 'Permanent Time (No Fall-Back)';
  } else {
    badgeEl.className = 'pill-badge switching';
    badgeEl.textContent = 'Observes Fall-Back (Nov 1)';
  }

  document.getElementById('drawer-badge-offset').textContent = `${timeInfo.offsetString} (${timeInfo.abbr})`;
  document.getElementById('drawer-policy-name').textContent = timeInfo.policyName;
  document.getElementById('drawer-legal-note').textContent = timeInfo.legalNote;
  document.getElementById('drawer-transition-status').textContent = timeInfo.transitionStatus;

  // Render major cities list
  const rule = TIMEZONE_RULES[regionId];
  const citiesGrid = document.getElementById('drawer-cities-grid');
  if (citiesGrid) {
    citiesGrid.innerHTML = '';
    const matchingCities = state.citiesData.filter((c) => c.region_id === regionId);
    matchingCities.forEach((c) => {
      const tag = document.createElement('span');
      tag.className = 'city-tag';
      tag.textContent = c.name;
      tag.addEventListener('click', () => {
        pinCity(c);
      });
      citiesGrid.appendChild(tag);
    });
  }
}

// Pin City on Map
function pinCity(city) {
  if (state.selectedCityMarker) {
    map.removeLayer(state.selectedCityMarker);
  }

  state.selectedCityMarker = L.marker([city.lat, city.lng], {
    title: city.name,
    riseOnHover: true
  }).addTo(map);

  const timeInfo = getRegionTime(city.region_id, state.currentDate);
  const timeStr = state.use24Hour ? timeInfo.wallClock.time24 : timeInfo.wallClock.time12;

  state.selectedCityMarker.bindPopup(`
    <div style="font-family: var(--font-family); min-width: 140px;">
      <strong style="font-size: 1rem;">📍 ${city.name}, ${city.province}</strong>
      <div style="font-family: var(--font-mono); font-size: 1.2rem; font-weight: 800; color: #38bdf8; margin: 4px 0;">
        ${timeStr}
      </div>
      <div style="font-size: 0.75rem; color: #64748b;">${timeInfo.name} (${timeInfo.abbr})</div>
    </div>
  `).openPopup();

  map.flyTo([city.lat, city.lng], 6, { duration: 1.2 });
  selectRegion(city.region_id);
}

// City Search Autocomplete
function initSearch() {
  const input = document.getElementById('search-input');
  const dropdown = document.getElementById('search-dropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    if (!val) {
      dropdown.style.display = 'none';
      return;
    }

    const matches = state.citiesData.filter(
      (c) => c.name.toLowerCase().includes(val) || c.province.toLowerCase().includes(val)
    ).slice(0, 8);

    if (matches.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = '';
    matches.forEach((c) => {
      const item = document.createElement('div');
      item.className = 'search-item';
      const timeInfo = getRegionTime(c.region_id, state.currentDate);
      item.innerHTML = `
        <span class="search-item-city">${c.name}, ${c.province}</span>
        <span class="search-item-tz" style="color: ${timeInfo.color}; font-weight: 600;">${timeInfo.abbr}</span>
      `;
      item.addEventListener('click', () => {
        input.value = `${c.name}, ${c.province}`;
        dropdown.style.display = 'none';
        pinCity(c);
      });
      dropdown.appendChild(item);
    });
    dropdown.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

// Time-Travel Simulator Controls
function initSimulator() {
  const slider = document.getElementById('timeline-slider');
  const display = document.getElementById('simulated-date-display');
  const btnLive = document.getElementById('btn-preset-live');
  const btnOct = document.getElementById('btn-preset-oct');
  const btnSwitch = document.getElementById('btn-preset-switch');
  const btnNov = document.getElementById('btn-preset-nov');

  if (!slider) return;

  slider.min = state.sliderMin;
  slider.max = state.sliderMax;
  slider.step = 3600 * 1000; // 1-hour step for slider

  function setSimulatedDate(date, isLive = false) {
    state.isLive = isLive;
    state.currentDate = date;
    slider.value = date.getTime();

    // Format display
    const options = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short'
    };
    display.textContent = isLive
      ? `LIVE • ${date.toUTCString().slice(17, 25)} UTC`
      : date.toLocaleDateString('en-US', options);

    updatePillActive();
    updateMapStyles();
    updateHubStrip();
    if (state.selectedRegionId) {
      renderSideDrawer(state.selectedRegionId);
    }
  }

  function updatePillActive() {
    [btnLive, btnOct, btnSwitch, btnNov].forEach((btn) => btn && btn.classList.remove('active'));
    if (state.isLive && btnLive) btnLive.classList.add('active');
  }

  slider.addEventListener('input', (e) => {
    setSimulatedDate(new Date(parseInt(e.target.value, 10)), false);
  });

  if (btnLive) {
    btnLive.addEventListener('click', () => {
      setSimulatedDate(new Date(), true);
      btnLive.classList.add('active');
    });
  }

  if (btnOct) {
    btnOct.addEventListener('click', () => {
      setSimulatedDate(new Date('2026-10-31T20:00:00Z'), false);
      btnOct.classList.add('active');
    });
  }

  if (btnSwitch) {
    btnSwitch.addEventListener('click', () => {
      setSimulatedDate(new Date('2026-11-01T06:30:00Z'), false);
      btnSwitch.classList.add('active');
    });
  }

  if (btnNov) {
    btnNov.addEventListener('click', () => {
      setSimulatedDate(new Date('2026-11-02T16:00:00Z'), false);
      btnNov.classList.add('active');
    });
  }
}

// Header Clocks & Interval Loop
function startClockLoop() {
  const utcClockEl = document.getElementById('utc-clock');
  const formatBtn = document.getElementById('btn-format-toggle');

  if (formatBtn) {
    formatBtn.addEventListener('click', () => {
      state.use24Hour = !state.use24Hour;
      formatBtn.textContent = state.use24Hour ? '24h' : '12h';
      updateHubStrip();
      updateMapStyles();
      if (state.selectedRegionId) {
        renderSideDrawer(state.selectedRegionId);
      }
    });
  }

  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => {
      document.getElementById('side-drawer').classList.add('hidden');
    });
  }

  setInterval(() => {
    if (state.isLive) {
      state.currentDate = new Date();
      const display = document.getElementById('simulated-date-display');
      if (display) {
        display.textContent = `LIVE • ${state.currentDate.toUTCString().slice(17, 25)} UTC`;
      }
    }

    // Update UTC clock in header
    if (utcClockEl) {
      const now = new Date();
      utcClockEl.textContent = `${now.toUTCString().slice(17, 25)} UTC`;
    }

    // Update Hub Bar
    updateHubStrip();

    // Update Side Drawer clock if open
    if (state.selectedRegionId) {
      const timeInfo = getRegionTime(state.selectedRegionId, state.currentDate);
      const clockEl = document.getElementById('drawer-clock-time');
      if (clockEl) {
        clockEl.textContent = state.use24Hour
          ? timeInfo.wallClock.time24
          : timeInfo.wallClock.time12;
      }
    }
  }, 1000);
}

// App Initialization Entrypoint
window.addEventListener('DOMContentLoaded', async () => {
  initMap();
  initHubStrip();
  initSimulator();
  startClockLoop();

  await loadGeoJson();
  await loadCities();

  // Select initial region
  selectRegion(state.selectedRegionId);
});
