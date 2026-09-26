// ============================================================
// StreetPAW / StrayCare Goa — Map Page (MapLibre GL JS only)
// ============================================================

// -----------------------------
// Navigation & Login
// -----------------------------
try {
  if (typeof requireLogin === "function") {
    requireLogin();
  }
} catch (error) {
  console.error("Login check error:", error);
}

try {
  if (typeof renderNav === "function") {
    renderNav("map");
  }
} catch (error) {
  console.error("Navigation error:", error);
}


// ============================================================
// MAP INITIALIZATION
// ============================================================

// MapLibre uses [lng, lat] order (Leaflet used [lat, lng] — that's flipped here)
const GOA_CENTER = [74.1240, 15.2993];

let map;
let markers = [];
let currentView = "markers";

if (typeof maplibregl === "undefined") {
  console.error("MapLibre GL failed to load.");
  const errorBox = document.getElementById("map");
  if (errorBox) {
    errorBox.innerHTML =
      '<p class="map-load-error">Map library failed to load. Please check your internet connection.</p>';
  }
} else {

  const mapContainer = document.getElementById("map");

  if (!mapContainer) {
    console.error("Map container #map was not found.");
  } else {

    // Create map
    map = new maplibregl.Map({
      container: "map",
      style: "https://styles.maptoolkit.org/summer.json",
      center: GOA_CENTER,
      zoom: 11,
      attributionControl: false // custom Maptoolkit badge is in map.html
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("error", (e) => {
      console.error("Map error:", (e && e.error) || e);
    });


    // ========================================================
    // LOAD ANIMAL REPORTS
    // ========================================================

    async function loadPins() {

      try {

        if (typeof apiRequest !== "function") {
          console.error("apiRequest() is not available.");
          return;
        }

        const pins = await apiRequest("/animals");

        console.log("Animal reports received:", pins);

        if (!Array.isArray(pins)) {
          console.error("Invalid animal data received:", pins);
          return;
        }

        drawMarkers(pins);
        drawHeatmap(pins);

      } catch (error) {

        console.error("Failed to load animal reports:", error);

      }
    }


    // ========================================================
    // DRAW MARKERS
    // ========================================================

    function drawMarkers(pins) {

      markers.forEach(m => m.remove());
      markers = [];

      let user = null;

      try {
        if (typeof getUser === "function") {
          user = getUser();
        }
      } catch (error) {
        console.warn("Could not get logged-in user.");
      }


      pins.forEach(pin => {

        // Make sure location exists
        if (
          !pin.location ||
          typeof pin.location.lat !== "number" ||
          typeof pin.location.lng !== "number"
        ) {
          console.warn("Invalid location:", pin);
          return;
        }


        // Marker color
        const color =
          pin.type === "rabies"
            ? "#e53935"
            : "#ffca28";


        // Custom marker element (plain div — no plugin needed)
        const el = document.createElement("div");
        el.className = "map-pin-dot";
        el.style.background = color;
        el.style.display = currentView === "markers" ? "block" : "none";

        el.addEventListener("click", (event) => {
          event.stopPropagation();
          showPinDetails(pin, user);
        });


        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([pin.location.lng, pin.location.lat])
          .addTo(map);

        markers.push(marker);

      });

    }


    // ========================================================
    // HEATMAP
    // ========================================================

    function toGeoJSON(pins, type) {
      return {
        type: "FeatureCollection",
        features: pins
          .filter(
            p =>
              p.type === type &&
              p.location &&
              typeof p.location.lat === "number" &&
              typeof p.location.lng === "number"
          )
          .map(p => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [p.location.lng, p.location.lat]
            },
            properties: {}
          }))
      };
    }

    function ensureHeatLayers() {

      if (!map.getSource("stray-heat")) {
        map.addSource("stray-heat", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        });
      }

      if (!map.getSource("rabies-heat")) {
        map.addSource("rabies-heat", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] }
        });
      }

      if (!map.getLayer("stray-heat-layer")) {
        map.addLayer({
          id: "stray-heat-layer",
          type: "heatmap",
          source: "stray-heat",
          layout: { visibility: currentView === "heatmap" ? "visible" : "none" },
          paint: {
            "heatmap-weight": 0.6,
            "heatmap-intensity": 1.1,
            "heatmap-radius": 35,
            "heatmap-opacity": 0.75,
            "heatmap-color": [
              "interpolate", ["linear"], ["heatmap-density"],
              0, "rgba(255,249,196,0)",
              0.3, "#fff9c4",
              0.6, "#ffe082",
              1, "#ffca28"
            ]
          }
        });
      }

      if (!map.getLayer("rabies-heat-layer")) {
        map.addLayer({
          id: "rabies-heat-layer",
          type: "heatmap",
          source: "rabies-heat",
          layout: { visibility: currentView === "heatmap" ? "visible" : "none" },
          paint: {
            "heatmap-weight": 1.0,
            "heatmap-intensity": 1.3,
            "heatmap-radius": 35,
            "heatmap-opacity": 0.8,
            "heatmap-color": [
              "interpolate", ["linear"], ["heatmap-density"],
              0, "rgba(255,205,210,0)",
              0.3, "#ffcdd2",
              0.6, "#ef5350",
              1, "#c62828"
            ]
          }
        });
      }
    }

    function drawHeatmap(pins) {

      ensureHeatLayers();

      const strayData = toGeoJSON(pins, "stray");
      const rabiesData = toGeoJSON(pins, "rabies");

      const straySource = map.getSource("stray-heat");
      const rabiesSource = map.getSource("rabies-heat");

      if (straySource) straySource.setData(strayData);
      if (rabiesSource) rabiesSource.setData(rabiesData);

    }


    // ========================================================
    // MARKER DETAILS
    // ========================================================

    function showPinDetails(pin, user) {

      const box = document.getElementById("pin-details");

      if (!box) {
        return;
      }


      box.classList.remove("hidden");


      const canManage =
        user &&
        user.role === "ngo";


      let imageHTML = "";

      if (
        pin.imageUrl &&
        typeof imageUrl === "function"
      ) {

        try {

          imageHTML = `
            <img
              src="${imageUrl(pin.imageUrl)}"
              style="
                width:100%;
                max-height:260px;
                object-fit:cover;
                border-radius:8px;
              "
            >
          `;

        } catch (error) {

          console.warn("Could not load image.");

        }

      }


      box.innerHTML = `

        ${imageHTML}

        <h3>
          ${
            pin.type === "rabies"
              ? "🔴 Suspected rabies case"
              : "🟡 Stray animal"
          }
        </h3>

        <p>
          ${pin.description || "No description provided."}
        </p>

        <p class="muted">
          Reported by ${pin.reporterName || "Unknown"}
          ·
          ${Number(pin.location.lat).toFixed(5)},
          ${Number(pin.location.lng).toFixed(5)}
        </p>

        <p>
          Status:
          <span class="status-${pin.status}">
            ${pin.status || "pending"}
          </span>
        </p>

        ${
          canManage
            ? `

              <select id="status-select">

                <option
                  value="pending"
                  ${
                    pin.status === "pending"
                      ? "selected"
                      : ""
                  }
                >
                  Pending
                </option>

                <option
                  value="in-progress"
                  ${
                    pin.status === "in-progress"
                      ? "selected"
                      : ""
                  }
                >
                  In Progress
                </option>

                <option
                  value="resolved"
                  ${
                    pin.status === "resolved"
                      ? "selected"
                      : ""
                  }
                >
                  Resolved
                </option>

              </select>

              <button
                id="update-status-btn"
                class="btn-small"
                style="
                  background:var(--color-primary);
                  color:white;
                  margin-left:8px;
                "
              >
                Update
              </button>

            `
            : ""
        }

      `;


      // Update status button
      const updateBtn =
        document.getElementById(
          "update-status-btn"
        );


      if (updateBtn) {

        updateBtn.addEventListener(
          "click",
          async () => {

            try {

              const select =
                document.getElementById(
                  "status-select"
                );

              const newStatus =
                select.value;


              await apiRequest(
                `/animals/${pin._id}/status`,
                "PATCH",
                {
                  status: newStatus
                }
              );


              await loadPins();


              showPinDetails(
                {
                  ...pin,
                  status: newStatus
                },
                user
              );


            } catch (error) {

              console.error(
                "Failed to update status:",
                error
              );

              alert(
                "Failed to update report status."
              );

            }

          }
        );

      }

    }


    // ========================================================
    // VIEW TOGGLE
    // ========================================================

    function setView(view) {

      currentView = view;

      markers.forEach(m => {
        m.getElement().style.display = view === "markers" ? "block" : "none";
      });

      if (map.getLayer("stray-heat-layer")) {
        map.setLayoutProperty(
          "stray-heat-layer",
          "visibility",
          view === "heatmap" ? "visible" : "none"
        );
      }

      if (map.getLayer("rabies-heat-layer")) {
        map.setLayoutProperty(
          "rabies-heat-layer",
          "visibility",
          view === "heatmap" ? "visible" : "none"
        );
      }

    }

    const markersButton = document.getElementById("view-markers-btn");
    const heatmapButton = document.getElementById("view-heatmap-btn");

    if (markersButton) {
      markersButton.addEventListener("click", () => {
        setView("markers");
        markersButton.classList.add("active-toggle");
        if (heatmapButton) heatmapButton.classList.remove("active-toggle");
      });
    }

    if (heatmapButton) {
      heatmapButton.addEventListener("click", () => {
        setView("heatmap");
        heatmapButton.classList.add("active-toggle");
        if (markersButton) markersButton.classList.remove("active-toggle");
      });
    }


    // ========================================================
    // INITIAL LOAD + AUTO REFRESH
    // ========================================================

    map.on("load", () => {
      ensureHeatLayers();
      loadPins();
    });

    setInterval(loadPins, 15000);

  }

}