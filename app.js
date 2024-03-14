const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

fetch('landmarks.json')
    .then(response => response.json())
    .then(landmarks => {
        landmarks.forEach(landmark => {
            const marker = L.marker([landmark.lat, landmark.lng]).addTo(map);
            marker.bindPopup(`<b>${landmark.name}</b><br><img src="${landmark.imageUrl}" style="width:100%;">`);
        });
    });
