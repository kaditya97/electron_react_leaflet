import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import 'leaflet-geosearch/dist/geosearch.css';
import { searchControl } from'./search';
import { OpenTopoMap, Stamen_Watercolor, CartoDB_DarkMatter, esri } from './layer';
import "leaflet.browser.print/dist/leaflet.browser.print.js";
import "leaflet-draw/dist/leaflet.draw.js";
import "leaflet-draw/dist/leaflet.draw.css";


const Wrapper = styled.div` 
    width: ${props => props.width};
    height: ${props => props.height};
`;

export default class Map extends React.Component {
    componentDidMount(){
        this.map = L.map('map', {
            center: [28, 85],
            zoom: 6
        });
        var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);

        var baseLayer = {
            "Open Street Map": osm,
            "Open Topo Map": OpenTopoMap,
            "Stamen Water color": Stamen_Watercolor,
            "Dark matter": CartoDB_DarkMatter,
            "Esri": esri,
        };

        L.control.layers(baseLayer).addTo(this.map);

        this.map.addControl(searchControl);
        L.control.browserPrint().addTo(this.map);

        var editableLayers = new L.FeatureGroup();
        this.map.addLayer(editableLayers);
        var options = {
            position: 'topright',
            draw: {
                polyline: {
                    shapeOptions: {
                        color: '#f357a1',
                        weight: 10
                    }
                },
                polygon: {
                    allowIntersection: false,
                    drawError: {
                        color: '#e1e100',
                        message: '<strong>Oh snap!<strong> you can\'t draw that!'
                    },
                    shapeOptions: {
                        color: '#bada55'
                    }
                },
                circle: false,
                rectangle: {
                    shapeOptions: {
                        clickable: false
                    }
                }
            },
            edit: {
                featureGroup: editableLayers,
            }
        };
        var drawControl = new L.Control.Draw(options);
        this.map.addControl(drawControl);
        this.map.on(L.Draw.Event.CREATED, function (e) {
            var type = e.layerType,
                layer = e.layer;
            if (type === 'marker') {
                var cord = layer.getLatLng().toString();
			    layer.bindPopup(cord).openPopup();
            }
        
            editableLayers.addLayer(layer);
        });
    }

    render(){
        return <Wrapper width="100%" height="100vh" id="map" />
    }
}