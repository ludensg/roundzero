let locationThresh = 50;
animationInProgress = false;

const customOptions = {
    className: 'custom-popup-size'
}

function getURLParameters() {
    var params = {};
    var search = window.location.search.substring(1);
    if (search) {
        search.split('&').forEach(function(part) {
            var item = part.split('=');
            params[item[0]] = decodeURIComponent(item[1]);
        });
    }
    return params;
}

var params = getURLParameters();


function colorToFilter(color) {
    const filters = {
        red: 'invert(35%) sepia(100%) saturate(6000%) hue-rotate(0deg) brightness(100%) contrast(100%)',
        blue: 'invert(33%) sepia(95%) saturate(6000%) hue-rotate(200deg) brightness(100%) contrast(100%)',
        green: 'invert(75%) sepia(50%) saturate(500%) hue-rotate(90deg) brightness(100%) contrast(90%)',
        yellow: 'invert(95%) sepia(90%) saturate(350%) hue-rotate(-5deg) brightness(105%) contrast(105%)',
        orange: 'invert(65%) sepia(95%) saturate(6000%) hue-rotate(14deg) brightness(100%) contrast(100%)',
        pink: 'invert(25%) sepia(95%) saturate(6000%) hue-rotate(330deg) brightness(100%) contrast(100%)',
        purple: 'invert(25%) sepia(95%) saturate(6000%) hue-rotate(260deg) brightness(100%) contrast(100%)',
        cyan: 'invert(80%) sepia(30%) saturate(7500%) hue-rotate(200deg) brightness(90%) contrast(-185%)',
        magenta: 'invert(20%) sepia(100%) saturate(6000%) hue-rotate(300deg) brightness(110%) contrast(100%)',
        lime: 'invert(90%) sepia(70%) saturate(6000%) hue-rotate(72deg) brightness(100%) contrast(100%)',
        brown: 'invert(60%) sepia(100%) saturate(600%) hue-rotate(15deg) brightness(90%) contrast(100%)',
        grey: 'brightness(0%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) contrast(85%)',
        teal: 'invert(50%) sepia(100%) saturate(1500%) hue-rotate(165deg) brightness(80%) contrast(85%)',
        navy: 'invert(30%) sepia(100%) saturate(700%) hue-rotate(210deg) brightness(70%) contrast(83%)',
    };    
    return filters[color.toLowerCase()] || ''; // Return the filter or an empty string if color not found
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

let locationGroups = [];
let sortedLocations;

let timoutAdd;

// Load and display markers from an external JSON file
fetch('performances/list.json')
//fetch('testcases/locations.json')
    .then(response => response.json())
    .then(data => {
        baseSetup(data.locations);   
        animationInProgress = true; // Disable popups during animation

        map.flyTo(data.locations[1].coordinates, 3, {
            animate: true,
            duration: 1.5 // Duration in seconds
        });       
        
        
        if (params.lat && params.lng && params.zoom) {
            const lat = parseFloat(params.lat);
            const lng = parseFloat(params.lng);
            const zoom = parseInt(params.zoom, 10);
            
            if(!isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
                animationInProgress = true;
                map.flyTo([lat, lng], zoom, {
                    animate: true,
                    duration: 3 // Duration in seconds
                });
            }
        }
        
        animationInProgress = false; // Disable popups during animation
    }).catch(error => console.error('Error loading the data:', error));



    function baseSetup(locations) {
        locationGroups = preprocessGroups(groupLocations(locations));
    
        locations.forEach((locationData) => {
            const coords = locationData.coordinates;
            const markerColor = colorToFilter(locationData.color);
            const customIcon = L.divIcon({
                className: 'custom-icon',
                html: `<img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" style="filter: ${markerColor};">`,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34]
            });
    
            const marker = L.marker(coords, {icon: customIcon}).addTo(map);
            marker.popupLocked = false; // property to track the popup's "lock" state
            marker.closeTimeout = null; // Timeout for closing the popup

            const popupContent = createPopupContent(locationData);            

            marker.bindPopup(popupContent, customOptions);

            // Event to open popup on hover
            marker.on('mouseover', function () {
                if (this.closeTimeout) {
                    clearTimeout(this.closeTimeout); // Clear the timeout if the mouse re-enters
                    this.closeTimeout = null;
                }
                this.openPopup();
            });

            // Event to close popup on mouse out, only if not "locked"
            marker.on('mouseout', function () {
                if (!this.popupLocked) {
                    if (this.closeTimeout) {
                        clearTimeout(this.closeTimeout); // Prevent multiple timeouts
                    }
                    // Set a timeout to close the popup
                    this.closeTimeout = setTimeout(() => {
                        this.closePopup();
                    }, 3000); // Delay in milliseconds (3000ms = 3 seconds)
                }
            });

            // Event to "lock" or "unlock" the popup on double click
            marker.on('dblclick', function () {
                this.popupLocked = !this.popupLocked; // Toggle the "lock" state
                if (this.popupLocked) {
                    if (this.closeTimeout) {
                        clearTimeout(this.closeTimeout); // Cancel any pending close if "locked"
                        this.closeTimeout = null;
                    }
                    this.openPopup();
                } else {
                    this.closePopup();
                }
            });

            // Adjusted for popupopen event
            marker.on('popupopen', function(e) {
                if (!animationInProgress) {
                    //const offsetMultiplier = L.Browser.mobile ? 0.32 : 0.42;
                    //const offset = map.getSize().y * offsetMultiplier;
                    //const currentZoom = map.getZoom();
                    //const targetPoint = map.project(e.target.getLatLng(), currentZoom).subtract([0, offset]);
                    //const targetLatLng = map.unproject(targetPoint, currentZoom);
                    //map.flyTo(targetLatLng, currentZoom, {animate: true, duration: 0.5});

                    setupSlideshow(locationData.id, marker);
                } else {
                    map.closePopup();
                }
            });
        });
    
        sortedLocations = locations.sort((a, b) => new Date(a.date) - new Date(b.date));
        const preprocessedGroups = preprocessGroups(locationGroups);
        preprocessedGroups.forEach((group, index) => {
            drawShape(group, index); // Assumes drawShape is correctly implemented
        });
    
        drawExtraPolygonsForCloseLocations(locationGroups, locationThresh); // Assumes this function is correctly implemented
    }
    

function createPopupContent(locationData) {
    let imagesHtml = '';
    for (let i = 1; i <= 3; i++) { // Assuming 3 images for simplicity.
        imagesHtml += `<img src="performances/${locationData.id}/${i}.jpg" 
        class="slideshow-image slideshow-image-${locationData.id}" alt="Image ${i}" 
        style="width:100%; max-height: 70%; ${i !== 1 ? 'display:none;' : ''}" 
        onclick="window.open(this.src, '_blank');">`;
    }

    let formattedDate = formatDate(locationData.date);

    return `
        <h3>${locationData.name}</h3>
        <h4>${formattedDate}</h4>
        <h5>${locationData.time}</h5>
        <p>${locationData.description}</p>
        <div class="slideshow-container" data-location-id="${locationData.id}">
            ${imagesHtml}
            <button class="slide-arrow left-arrow">&#10094;</button>
            <button class="slide-arrow right-arrow">&#10095;</button>
        </div>`;
}

function formatDate(dateString) {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate() + 1;

    // Function to get the date suffix
    function getDaySuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }

    return `${month} ${day}${getDaySuffix(day)}, ${year}`;
}

// Usage example:
const formattedDate = formatDate("2024-03-22");
console.log(formattedDate); // Outputs: March 22nd, 2024



function setupSlideshow(locationId , marker) {
    const container = document.querySelector(`.slideshow-container[data-location-id="${locationId}"]`);
    if (!container) return;

    const images = container.querySelectorAll('img');
    let currentIndex = 0;

    function showImage(index) {
        images.forEach((img, i) => {
            img.style.display = i === index ? 'block' : 'none';
        });

        resetCloseTimeout(); // Reset the timeout whenever the image is shown

    }
    
    function resetCloseTimeout() {
        if (marker.closeTimeout) {
            clearTimeout(marker.closeTimeout); // Clear the existing timeout
            marker.closeTimeout = null;
        }
        // Set a new timeout to close the popup
        marker.closeTimeout = setTimeout(() => {
            marker.closePopup();
        }, 3000); // Adjust the timeout duration as needed
    }


    container.querySelector('.left-arrow').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    });

    container.querySelector('.right-arrow').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    });

    // Initially display the first image
    showImage(currentIndex);
}



// Function to update the active polygon based on the current date
// Helper function to parse dates in YYYY-MM-DD format
function parseDate(str) {
    const [year, month, day] = str.split("-");
    return new Date(year, month - 1, day);
}

function isFollowedByAnotherGroup(locationId, locationGroups) {
    // Find the index of the group that contains the given locationId
    let groupIndex = -1;
    for (let i = 0; i < locationGroups.length; i++) {
        const group = locationGroups[i];
        const locationIds = group.map(location => location.id);
        if (locationIds.includes(locationId)) {
            groupIndex = i;
            break;
        }
    }

    // Determine if there's a next group after the current group
    const hasNextGroup = groupIndex !== -1 && groupIndex < locationGroups.length - 1;

    return hasNextGroup;
}



function calculateBlockIndex(date, startDate) {
    const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in one day
    const difference = date - startDate;
    const daysSinceStart = Math.floor(difference / oneDay);
    return Math.floor(daysSinceStart / 10) % 36; // 10-day blocks, repeating every 36 blocks
}

function groupLocations(locations) {
    const startDate = parseDate("2024-03-15");
    const groups = Array.from({ length: 36 }, () => []);

    locations.forEach(location => {
        const locationDate = parseDate(location.date);
        const blockIndex = calculateBlockIndex(locationDate, startDate);
        groups[blockIndex].push(location);
    });

    return groups.filter(group => group.length > 0); // Filter out empty groups
}

function lightenColor(color, percent) {
    var num = parseInt(color.replace("#",""),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        B = (num >> 8 & 0x00FF) + amt,
        G = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
}


function drawShape(locations, groupIndex) {
    const getCssVariable = (varName) => getComputedStyle(document.documentElement).getPropertyValue(varName);

    const fillColors = [];
    for (let i = 1; i <= locationGroups.length; i++) {
        fColor = i % 8;
        if(extraPoly) {fillColors.push(getCssVariable(`--bright-polygon-color-${fColor}`).trim());  }
        else{ fillColors.push(getCssVariable(`--polygon-color-${fColor}`).trim()); }
    }
    
    // Optionally, create a glow effect for each polygon
    //createGlowPolygon(coords, 0.01, { color: 'gold', fillColor: 'gold', fillOpacity: 0.3, weight: 0 });


    const fillColor = fillColors[groupIndex % fillColors.length];
    const glowColor = lightenColor(fillColor, 20); // Lighten by 40%
    const expansionAmount = 50;

        // Hinge logic adjusted to check if followed by another group
        const isHinge = locations.length === 1 && isFollowedByAnotherGroup(locations[0].id, locationGroups);
        if (isHinge && !notAlone) {
            // Logic for hinge when not followed by another group
            // Simulating an outer glow effect for hinge circles
            // Draw larger outer circle for glow effect
            var location = locations[0].coordinates;
            L.circle(location, {
                color: glowColor,
                fillColor: glowColor,
                fillOpacity: 0.3,
                radius: 50 + expansionAmount,
                weight: 0
            }).addTo(map);
            // Draw smaller filled circle
            L.circle(location, {
                color: fillColor,
                fillColor: 'transparent',
                fillOpacity: 0.5,
                radius: 30, // Smaller inner circle
                weight: 2
            }).addTo(map);
        } else  {
            if (locations.length === 1 && !notAlone && !isHinge) {
                    var location = locations[0].coordinates;
                
                    // Trigger the first pulse immediately
                    addPulsingCircle(map, location, fillColor);
                
                    // Start a new pulse every 2 seconds
                    setInterval(() => {
                        addPulsingCircle(map, location, fillColor);
                    }, 2000);           
                 } else if (locations.length === 2) {
                // Draw a glowing line for two locations
                var points = locations.map(location => location.coordinates);
                L.polyline(points, {
                    color: glowColor, // Glowing color
                    opacity: 0.3,
                    weight: 0 // Thicker line for glow effect
                }).addTo(map);
                // Draw the actual line
                L.polyline(points, {
                    color: fillColor, 
                    opacity: 0.8,
                    weight: 1.3
                }).addTo(map);
            } else if (locations.length > 2) {
                // Draw a glowing polygon
                var points = locations.map(location => location.coordinates);
                // Glow effect
                L.polygon(points, {
                    color: glowColor,
                    fillColor: glowColor,
                    fillOpacity: 0.2,
                    opacity: 0.0,
                    weight: 0 // Thicker border for glow effect
                }).addTo(map);
                // Actual polygon
                L.polygon(points, {
                    color: 'grey',
                    fillColor: fillColor,
                    fillOpacity: 0.6,
                    weight: 0.5
                }).addTo(map);
            }
    }
}

function preprocessGroups(locationGroups) {
    // Assume locationGroups is an array of arrays, each containing location objects

    locationGroups.forEach((group, index) => {
        if (group.length === 1) { // This is a potential hinge
            const hingeLocation = group[0];
            // Check and connect with the previous group if available
            if (index > 0 && locationGroups[index - 1].length > 1) {
                locationGroups[index - 1].push(hingeLocation);
            }
            // Check and connect with the next group if available
            if (index < locationGroups.length - 1 && locationGroups[index + 1].length > 1) {
                locationGroups[index + 1].unshift(hingeLocation);
            }
        }
    });

    // Return potentially modified groups with hinges properly integrated
    return locationGroups;
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

function areLocationsClose(loc1, loc2, thresholdInKm) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    var R = 6371; // Earth radius in km
    var dLat = toRad(loc2[0] - loc1[0]);
    var dLon = toRad(loc2[1] - loc1[1]);
    var lat1 = toRad(loc1[0]);
    var lat2 = toRad(loc2[0]);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    var distance = R * c;
    return distance <= thresholdInKm;
}

function findCloseLocationGroups(locationGroups, thresholdInKm) {
    let closeGroups = [];

    locationGroups.forEach((group, index) => {
        // Temporary array to hold locations that are close to each other within this group
        let tempCloseGroup = [];
        
        group.forEach((location, locIndex) => {
            group.forEach((otherLocation, otherLocIndex) => {
                if (locIndex !== otherLocIndex && areLocationsClose(location.coordinates, otherLocation.coordinates, thresholdInKm)) {
                    if (!tempCloseGroup.includes(location)) {
                        tempCloseGroup.push(location);
                    }
                    if (!tempCloseGroup.includes(otherLocation)) {
                        tempCloseGroup.push(otherLocation);
                    }
                }
            });
        });

        if (tempCloseGroup.length > 0) {
            closeGroups.push(tempCloseGroup);
        }
    });

    return closeGroups;
}

let extraPoly = false;

function drawExtraPolygonsForCloseLocations(locationGroups, thresholdInKm) {
    const closeGroups = findCloseLocationGroups(locationGroups, thresholdInKm);
    extraPoly = true;
    closeGroups.forEach((group, index) => {
        // Assuming drawShape can handle drawing polygons for a group of locations
        drawShape(group, index); // This uses the existing drawShape function; adjust as needed
    });
    extraPoly = false;
}

function addPulsingCircle(map, location, fillColor) {
    let radius = 0;
    const maxRadius = 1000; // Maximum radius of the circle
    const stepSize = 10;    // How much the radius increases each step
    const pulseDuration = 2000; // Duration of each pulse in milliseconds
    const steps = pulseDuration / stepSize;
    const opacityStep = 1 / steps; // Decrease in opacity each step

    const intervalId = setInterval(() => {
        radius += maxRadius / steps;
        if (radius > maxRadius) {
            clearInterval(intervalId);
            map.removeLayer(pulseCircle);
            return;
        }

        // Remove the previous circle
        if (pulseCircle) map.removeLayer(pulseCircle);

        // Add a new, larger and more transparent circle
        pulseCircle = L.circle(location, {
            color: fillColor,
            fillColor: fillColor,
            fillOpacity: Math.max(0, 1 - (radius / maxRadius)),
            radius: radius,
            weight: 1
        }).addTo(map);
    }, stepSize);
    
    let pulseCircle = L.circle(location, {
        color: fillColor,
        fillColor: fillColor,
        fillOpacity: 1,
        radius: radius,
        weight: 1
    }).addTo(map);
}



function clearMap() {
    map.eachLayer((layer) => {
        if (!layer._url) { // Check if it's not the base tile layer
            map.removeLayer(layer);
        }
    });
}

function resetMap(locations) {
    clearMap();
    notAlone = false;
    baseSetup(locations);
}

let notAlone = false;

function animateLocationsSequentially(locations, index = 0) {
    const lastLocation = locations[index - 1];

       // Default values if there's no next location
       let distance = 0;
       let speed = 25000000; // meters per second (adjust based on desired speed)
       let duration = 1; // default duration in seconds


    if (index >= locations.length) {
        console.log("Animation completed.");
        animationInProgress = false; // Indicate animation has completed
        resetMap(locations);
        map.flyTo(lastLocation.coordinates, 9, {
            animate: true,
            duration: 2 // Duration in seconds
        });
        return; // Stop the animation once all locations are processed
    }

    if (index == 0) {notAlone = true;}

    const currentLocation = locations[index];
    const nextLocation = locations[index + 1] || null;

    // Add marker for the current location
    const markerColor = colorToFilter(currentLocation.color); // Convert color name to CSS filter
    const customIcon = L.divIcon({
        className: 'custom-icon', // This class is used in the CSS rules
        html: `<img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" style="filter: ${markerColor};">`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });

    const marker = L.marker(currentLocation.coordinates, {icon: customIcon}).addTo(map);
    const popupContent = createPopupContent(currentLocation);
    marker.bindPopup(popupContent, customOptions);

    
   
       if (nextLocation) {
           distance = calculateDistance(currentLocation.coordinates[0], currentLocation.coordinates[1], nextLocation.coordinates[0], nextLocation.coordinates[1]);
           durationMin = Math.max(1, distance / speed);
           duration = Math.min(durationMin, 5); // Ensure duration is at least 1 second
       }   

    // Adjust the map view to the current location
    map.flyTo(currentLocation.coordinates, 12, {
        animate: true,
        duration: duration // Duration in seconds
    });

    // Continue the animation with the next location after a delay
    setTimeout(() => {
        animateLocationsSequentially(locations, index + 1);
    }, duration * 1000 + 1000); // Delay before moving to the next location
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

function groupChanged(loc1, loc2) {
    const startDate = parseDate("2024-03-15"); // Starting point of the first group
    const groupInterval = 10; // Days defining each group's duration

    // Calculate the group index for each location based on the date
    const groupIndex1 = Math.floor((parseDate(loc1.date) - startDate) / (groupInterval * 24 * 3600 * 1000));
    const groupIndex2 = Math.floor((parseDate(loc2.date) - startDate) / (groupInterval * 24 * 3600 * 1000));

    // Two locations belong to different groups if their group indices are different
    return groupIndex1 !== groupIndex2;
}

document.getElementById('animateButton').addEventListener('click', function() {
    animationInProgress = true; // Disable popups during animation
    clearMap();
    animateLocationsSequentially(sortedLocations);
});
