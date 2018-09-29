let map = L.map('map');

/* Dark basemap */
let url = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png';
L.tileLayer(url, {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd'
}).addTo(map);

/* Temperature and Geopotencial Height in GeoTIFF with 2 bands */
d3.request("data/tz850.tiff").responseType('arraybuffer').get(
    function (error, tiffData) {
        // Geopotential height (BAND 0)
        let geo = L.ScalarField.fromGeoTIFF(tiffData.response, bandIndex = 0);

        let layerGeo = L.canvasLayer.scalarField(geo, {
            color: chroma.scale('RdPu').domain(geo.range),
            opacity: 0.65
        }).addTo(map);
        layerGeo.on('click', function (e) {
            if (e.value !== null) {
                let v = e.value.toFixed(0);
                let html = (`<span class="popupText">Geopotential height ${v} m</span>`);
                let popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent(html)
                    .openOn(map);
            }
        });

        // Temperature (BAND 1)
        let t = L.ScalarField.fromGeoTIFF(tiffData.response, bandIndex = 1);
        let layerT = L.canvasLayer.scalarField(t, {
            color: chroma.scale('OrRd').domain(t.range),
            opacity: 0.65
        });
        layerT.on('click', function (e) {
            if (e.value !== null) {
                let v = e.value.toFixed(1);
                let html = (`<span class="popupText">Temperature ${v} ºC</span>`);
                let popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent(html)
                    .openOn(map);
            }
        });

        L.control.layers({
            "Geopotential Height": layerGeo,
            "Temperature": layerT
        }, {}, {
                position: 'bottomleft',
                collapsed: false
            }).addTo(map);

        map.fitBounds(layerGeo.getBounds());

    });