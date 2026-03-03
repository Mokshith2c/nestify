mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coordinates,//(listing.geometry.coordinates),
    zoom: 6
});

const el = document.createElement("div");
el.innerHTML = `<i class="bi bi-house-fill"></i>`;
el.className = "home-marker";


const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates)//(listing.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({offset: 25, className:"popup"})
        .setHTML(`<p>Exact Location after booking</p>`)
        .setMaxWidth("300px"))
        .addTo(map);



