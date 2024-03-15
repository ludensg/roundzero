
function colorToFilter(color) {
    const filters = {
        red: 'invert(35%) sepia(100%) saturate(6000%) hue-rotate(0deg) brightness(100%) contrast(100%)',
        blue: 'invert(33%) sepia(95%) saturate(6000%) hue-rotate(200deg) brightness(100%) contrast(100%)',
        green: 'invert(75%) sepia(50%) saturate(500%) hue-rotate(90deg) brightness(100%) contrast(90%)',
        yellow: 'invert(95%) sepia(90%) saturate(350%) hue-rotate(-5deg) brightness(105%) contrast(105%)',
        orange: 'invert(65%) sepia(95%) saturate(6000%) hue-rotate(14deg) brightness(100%) contrast(100%)',
        pink: 'invert(25%) sepia(95%) saturate(6000%) hue-rotate(330deg) brightness(100%) contrast(100%)',
        purple: 'invert(25%) sepia(95%) saturate(6000%) hue-rotate(260deg) brightness(100%) contrast(100%)',
        cyan: 'invert(80%) sepia(30%) saturate(7500%) hue-rotate(180deg) brightness(90%) contrast(85%)',
        magenta: 'invert(20%) sepia(100%) saturate(6000%) hue-rotate(300deg) brightness(110%) contrast(100%)',
        lime: 'invert(90%) sepia(70%) saturate(6000%) hue-rotate(72deg) brightness(100%) contrast(100%)',
        brown: 'invert(60%) sepia(100%) saturate(600%) hue-rotate(15deg) brightness(90%) contrast(100%)',
        grey: 'brightness(0%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) contrast(85%)',
        teal: 'invert(50%) sepia(100%) saturate(1500%) hue-rotate(165deg) brightness(80%) contrast(85%)',
        navy: 'invert(30%) sepia(100%) saturate(700%) hue-rotate(210deg) brightness(70%) contrast(83%)'
    };    
    return filters[color.toLowerCase()] || ''; // Return the filter or an empty string if color not found
}

function isCutOutBlock(blockIndex) {
    // Returns true for even blocks, assuming the first block has an index of 0
    return blockIndex % 2 === 1; // Change to `0` if you want the first block to be a "cut-out" block
}


// Initialize the map on the "map" div
var map = L.map('map').setView([20, 0], 2);

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; OpenStreetMap contributors'
}).addTo(map);

// Function to create a subtle glow effect around the polygon
function createGlowPolygon(baseCoords, adjustmentFactor, glowOptions) {
    let glowCoords = baseCoords.map(coord => [
        coord[0] + adjustmentFactor,
        coord[1] + adjustmentFactor
    ]);
    return L.polygon(glowCoords, glowOptions).addTo(map);
}

// Function to dynamically change a polygon's opacity
function applyGlimmerEffect(polygon) {
    let opacityDirection = 'decreasing';
    setInterval(() => {
        let currentOpacity = polygon.options.fillOpacity;
        const opacityStep = 0.02;
        if (opacityDirection === 'decreasing') {
            currentOpacity -= opacityStep;
            if (currentOpacity <= 0.1) {
                opacityDirection = 'increasing';
            }
        } else {
            currentOpacity += opacityStep;
            if (currentOpacity >= 0.3) {
                opacityDirection = 'decreasing';
            }
        }
        polygon.setStyle({ fillOpacity: currentOpacity });
    }, 200);
}

// Load and display polygons from an external JSON file
fetch('polygons.json')
    .then(response => response.json())
    .then(data => {
        data.polygons.forEach((polygonData, polygonIndex) => {
            // Define CSS filters for different marker colors
        
            

            polygonData.features.forEach((feature, featureIndex) => {
                const coords = feature.coordinates;
        
                const markerColor = colorToFilter(feature.color); // Convert color name to CSS filter

                const customIcon = L.divIcon({
                    className: 'custom-icon', // This class is used in the CSS rules
                    html: `<img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" style="filter: ${markerColor};">`,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
                });                
        
                const marker = L.marker([coords[0], coords[1]], {icon: customIcon}).addTo(map);
        
                // Creating the HTML content for the popup with description and image
                const popupContent = `
                    <h3>${feature.name}</h3>
                    <p>${feature.description}</p>
                    <img src="${feature.imageUrl}" alt="${feature.name}" style="width:100%;">
                `;
        
                marker.bindPopup(popupContent);
        
                // If you prefer the popup to open on hover
                marker.on('mouseover', function (e) {
                    this.openPopup();
                });
                marker.on('mouseout', function (e) {
                    this.closePopup();
                });
            });
        });
        
            data.polygons.forEach((polygonData, index) => {
                const getCssVariable = (varName) => getComputedStyle(document.documentElement).getPropertyValue(varName);

                const fillColors = [
                    getCssVariable('--polygon-color-1').trim(),
                    getCssVariable('--polygon-color-2').trim(),
                    getCssVariable('--polygon-color-3').trim(),
                    getCssVariable('--polygon-color-4').trim(),
                    getCssVariable('--polygon-color-5').trim(),
                    getCssVariable('--polygon-color-6').trim()
                ];
                const fillColor = fillColors[index % fillColors.length];

                let polygonCoords = polygonData.features.map(feature => feature.coordinates);
                let polygon = L.polygon(polygonCoords, {
                    color: 'grey',
                    fillColor: fillColor,  // Fill color from array
                    fillOpacity: 0.3,
                    weight: .5             // Outline thickness in pixels
                }).addTo(map);

                
            });

            polygon.features.sort((a, b) => {
                // Convert startDate to a date object if it's a string
                let dateA = new Date(a.startDate);
                let dateB = new Date(b.startDate);
                return dateA - dateB;
            });

            groupedEntries.forEach((group, index) => {
                // This example simply combines the coordinates of the group's entries for the shared polygon.
                // You may want a more sophisticated way to determine the shape or bounds of the shared polygon.
                let sharedCoords = group.reduce((acc, polygonData) => {
                    let coords = polygonData.features.map(f => f.coordinates);
                    return acc.concat(coords);
                }, []);
            
                // Create the shared polygon
                let sharedPolygon = L.polygon(sharedCoords, {
                    color: 'white', // Shared polygon styling
                    fillColor: 'rgba(255, 0, 0, 0.5)', // Example: semi-transparent red
                    fillOpacity: 0.5,
                    weight: 1
                }).addTo(map);
            
                // Initially, you might want to hide the shared polygon or manage its visibility along with the animation cycle
                sharedPolygon.remove(); // or use .addTo(map) to show
            });

            let showSharedPolygons = false; // Toggle control

setInterval(() => {
    if (showSharedPolygons) {
        // Hide individual and block-based polygons, show shared polygons
        individualPolygons.forEach(p => p.remove());
        colorGroupedPolygons.forEach(p => p.remove());
        sharedPolygons.forEach(p => p.addTo(map)); // Assuming sharedPolygons holds your shared group polygons
    } else {
        // Show individual or block-based polygons, hide shared polygons
        sharedPolygons.forEach(p => p.remove());
        // Add logic to decide whether to show individual or block-based polygons
    }
    showSharedPolygons = !showSharedPolygons;
}, 5000); // Example: toggle every 5 seconds

            
            
            polygonData.leafletPolygon = polygon; // Store the Leaflet polygon for later updates

            // Optionally, create a glow effect for each polygon
            createGlowPolygon(coords, 0.01, { color: 'gold', fillColor: 'gold', fillOpacity: 0.3, weight: 0 });

            // Initially, no glimmer effect is applied

        // Now, determine and update the active polygon based on the current date
        updateActivePolygon(data.polygons);        

    })

    
    .catch(error => console.error('Error loading the data:', error));

// Function to update the active polygon based on the current date
// Helper function to parse dates in YYYY-MM-DD format
function parseDate(str) {
    const [year, month, day] = str.split("-");
    return new Date(year, month - 1, day);
}

// Determines if the current date falls within the range to make the polygon active
function isActivePolygon(startDateStr, currentIndex, totalPolygons) {
    const startDate = parseDate(startDateStr);
    const currentDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day

    // Calculate days since start for both current date and polygon's start date
    const daysSinceStart = Math.floor((currentDate - startDate) / oneDay);

    // Assume each polygon is active for 10 days, with a cycle reset after all polygons have been active
    const daysPerPolygon = 10;
    const cycleLength = daysPerPolygon * totalPolygons;
    const currentCycleDay = daysSinceStart % cycleLength;

    // Determine if current polygon is active based on its position in the cycle
    return currentCycleDay >= (currentIndex * daysPerPolygon) && currentCycleDay < ((currentIndex + 1) * daysPerPolygon);
}

// Updated function to determine and update the active polygon
function updateActivePolygon(polygons) {
    const totalPolygons = polygons.length;

    polygons.forEach((polygonData, index) => {
        const polygon = polygonData.leafletPolygon;
        if (isActivePolygon(polygonData.startDate, index, totalPolygons)) {
            // This polygon is currently active
            polygon.setStyle({
                color: 'purple',
                fillColor: '#e09c4f',
                fillOpacity: 0.6,
                weight: 2
            });
            applyGlimmerEffect(polygon); // Apply dynamic glimmer effect to active polygon
        } else {
            // This polygon is currently frozen
            polygon.setStyle({
                color: 'grey',
                fillColor: '#cccccc',
                fillOpacity: 0.2,
                weight: 1
            });
            // Optionally, remove any dynamic effects or interactions specific to active polygons
        }
    });
}
