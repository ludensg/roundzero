const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
    maxZoom: 20,
}).addTo(map);

fetch('landmarks.json')
    .then(response => response.json())
    .then(landmarks => {
        landmarks.forEach(landmark => {
            const marker = L.marker([landmark.lat, landmark.lng]).addTo(map);
            marker.bindPopup(`<b>${landmark.name}</b><br><img src="${landmark.imageUrl}" style="width:100%;">`);
        });
    });
