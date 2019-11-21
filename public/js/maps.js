/* eslint-disable */

export const displayLocation = tours => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoiYWxpc2hiYTEzIiwiYSI6ImNrMnB6eGdmajA5MXYzam55NHh2cHF4Zm0ifQ.-ADsLJ3imReXWEhdyDth1g';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/alishba13/ck2qtrii02uan1cqxagczqueo',
        //Zoom: 30,
        scrollZoom: false,
        Zoom: 5
        //interactive: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    tours.forEach(loc => {
        //Creating marker
        const div = document.createElement('div');
        div.className = 'marker';

        //adding  marker to  map
        new mapboxgl.Marker({
            element: div,
            anchor: 'bottom' //display settings e.g can be center
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        new mapboxgl.Popup({ offset: 30 })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day} :${loc.description}</p>`)
            .addTo(map);
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, { padding: { top: 200, bottom: 100, left: 100, right: 100 } });
};
