import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const provider = new OpenStreetMapProvider();

export const searchControl = new GeoSearchControl({
    provider: provider,
    position: 'topright',
    style: 'bar',
    showMarker: true,
    showPopup: false,
    marker: {
      icon: new L.Icon.Default(),
      draggable: false,
    },
    popupFormat: ({ query, result }) => result.label,
    maxMarkers: 1,
    retainZoomLevel: false,
    animateZoom: true,
    autoClose: false,
    searchLabel: 'Enter address',
    keepResult: false,
});