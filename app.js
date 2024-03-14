// Initialize the map on the "map" div
var map = L.map('map').setView([20, 0], 2);

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; OpenStreetMap contributors'
}).addTo(map);

// Function to create a subtle glow effect around the polygon
function createGlowPolygon(baseCoords, adjustmentFactor, glowOptions) {
    // Adjust the base coordinates for the glow effect
    let glowCoords = baseCoords.map(coord => [
        coord[0] + adjustmentFactor,
        coord[1] + adjustmentFactor
    ]);

    // Create and return the glow polygon
    return L.polygon(glowCoords, glowOptions).addTo(map);
}

// Load and display landmarks from an external JSON file
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Container for landmark coordinates
        let landmarkCoords = [];

        L.geoJSON(data, {
            onEachFeature: function (feature, layer) {
                // Bind a popup to each landmark
                layer.bindPopup(feature.properties.name);

                // Add this landmark's coordinates to the array
                if (feature.geometry.type === "Point") {
                    // Reverse coordinates for Leaflet's [lat, lng] format
                    landmarkCoords.push(feature.geometry.coordinates.slice().reverse());
                }
            }
        }).addTo(map);

        // Check if we have enough points to form a polygon
        if (landmarkCoords.length > 2) {
            // Add a subtle glow effect around the polygon
            let glowPolygon = createGlowPolygon(landmarkCoords, 0.05, {
                color: 'gold',
                fillColor: 'gold',
                fillOpacity: 0.3,
                weight: 0
            });

            // Create the main polygon connecting all landmarks
            var polygon = L.polygon(landmarkCoords, {
                color: 'purple',
                fillColor: '#e09c4f',
                fillOpacity: 0.6,
                weight: 2
            }).addTo(map);

            // Adjust the view to fit both the polygon and its glow
            map.fitBounds(polygon.getBounds());

            // Function to dynamically change the polygon's opacity for a smoother glimmer effect
            let opacityDirection = 'decreasing';
            setInterval(() => {
                let currentOpacity = polygon.options.fillOpacity;
                const opacityStep = 0.04;
                if (opacityDirection === 'decreasing') {
                    currentOpacity -= opacityStep;
                    if (currentOpacity <= 0.05) {
                        opacityDirection = 'increasing';
                    }
                } else {
                    currentOpacity += opacityStep;
                    if (currentOpacity >= 0.25) {
                        opacityDirection = 'decreasing';
                    }
                }
                polygon.setStyle({ fillOpacity: currentOpacity });
            }, 250);
        }
    })
    .catch(error => console.error('Error loading the data:', error));
