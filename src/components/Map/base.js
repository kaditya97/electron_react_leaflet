import React, { Component } from "react";
//import { render } from "react-dom";
import L from "leaflet";
//import 'leaflet/dist/leaflet.css';
import $ from "jquery";
import "block-ui";
import "block-ui/jquery.blockUI.js";
import "./customStyle.css";
import "leaflet-svg-shape-markers/dist/leaflet-svg-shape-markers.min.js";
import "leaflet.browser.print/dist/leaflet.browser.print.js";

let config = {};
config.params = {
  center: [-33.0345717, -71.5655199], // center on R5
  zoomControl: false,
  zoom: 12,
  maxZoom: 17,
  minZoom: 8,
  scrollwheel: false,
  legends: true,
  infoControl: false,
  attributionControl: true,
  loadingControl: true
};

config.tileLayer = {
  uri:
    "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmJhbmRlcmEiLCJhIjoiY2oyajRvZXJzMDAxbjMycG02eG1sMWg5aiJ9.kUnxCm8ekYilSA3uYGDZhw",
  params: {
    attribution:
      '&copy <a href="http://openstreetmap.org">OpenStreetMap</a> - ' +
      '&copy <a href="http://mapbox.com">Mapbox</a>',
    id: "",
    accessToken: ""
  }
};

var baselayer1 = new L.FeatureGroup();
var baselayer2 = new L.FeatureGroup();

var overlayerPolygon = new L.FeatureGroup();

class BaseMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      tileLayer: null,
      drawPolygon: null,
      geojsonDataPolygon: null,
      geojsonLayerPolygon: null,
      indicatorName: null,
      legendControl: null,
      printButton: null
    };
    this._mapNode = null;
    this.addLegend = this.addLegend.bind(this);
    this.removeLegend = this.removeLegend.bind(this);
    this.mapColor = this.mapColor.bind(this);
    this.stylePolygon = this.stylePolygon.bind(this);
    this.updateMap = this.updateMap.bind(this);
    this.printButton = this.printButton.bind(this);
  }

  componentDidMount() {
    if (!this.state.map) this.init(this._mapNode);
  } //componentDidMount

  componentDidUpdate(prevProps, prevState) {
    // code to run when the component receives new props or state
    if (this.state.drawPolygon) {
      //console.log("draw!");
      this.addGeoJSONLayer(this.state.geojsonDataPolygon);
    }
  } //componentDidUpdate

  zoomToFeature(target) {
    // pad fitBounds() so features aren't hidden under the Filter UI element
    var fitBoundsParams = {
      paddingTopLeft: [-1, -1],
      paddingBottomRight: [-1, -1]
    };
    // set the map's center & zoom so that it fits the geographic extent of the layer
    this.state.map.fitBounds(target.getBounds(), fitBoundsParams);
  }

  removeGeoJSONLayer() {
    // Clear the geojson layers
    if (this.state.geojsonLayerPolygon !== null) {
      this.removeLegend();
      this.state.geojsonLayerPolygon.clearLayers();
    }
  } //removeGeoJSONLayer

  getData(indicatorName) {
    // jQuery code to run blockUI after ajax and unblock before ajax calls
    //Block the UI in all AJAX calls
    $(document)
      .ajaxStart(
        $.blockUI({
          message: "<h1> Loading...</h1>"
        })
      )
      .ajaxStop($.unblockUI);

    //var layerPolygon = L.geoJson(null).addTo(overlayerPolygon);

    $.getJSON(
      //"https://gist.githubusercontent.com/anonymous/264fdd9de2f41d2536de/raw/2c35bf05677071d27dca2c8f94b89287dc24ed06/test.geojson",
      "https://gist.githubusercontent.com/luispina/ecc0d3e038803473f29878ad4852df5b/raw/350f85c1c5a964a86d5c0542012060f3159cb37d/R5.geojson",
      jsonData => {
        this.setState({
          geojsonDataPolygon: jsonData,
          drawPolygon: true
        }); //setState
      }
    ); // getJSON Polygon
  } // function getData

  addGeoJSONLayer(geojsonDataPolygon) {
    const layerPolygon = L.geoJson(geojsonDataPolygon, {
      style: this.stylePolygon
    });

    layerPolygon.addTo(overlayerPolygon);
    this.addLegend();

    this.setState({ geojsonLayerPolygon: layerPolygon });
    this.setState({ drawPolygon: false });

    // fit the geographic extent of the GeoJSON layer within the map's bounds / viewport
    this.zoomToFeature(layerPolygon);
  } //addGeoJSONLayer

  mapColor(indicatorValueColumn) {
    return indicatorValueColumn > 75
      ? "#128b4a"
      : indicatorValueColumn > 50
      ? "#f9a560"
      : indicatorValueColumn > 25
      ? "#ef5962"
      : indicatorValueColumn > 0
      ? "#ec2c33"
      : indicatorValueColumn == null
      ? "#a11c23"
      : "#d8d8d8";
  } //mapColor

  stylePolygon(feature) {
    let indicatorValueColumn;
    //if(indicatorsPOIArray.includes(this.state.indicatorName) || this.state.indicatorName === 'gse'){
    indicatorValueColumn = feature.properties.value;

    return {
      fillColor: this.mapColor(indicatorValueColumn), // get attributes from geojson feature selected
      weight: "1", // border width; if value = '' or '0' no width border -> no border
      color: this.mapColor(indicatorValueColumn), //Outline color; if value = 0 there is no border
      dashArray: "", // dunnow
      fillOpacity: 1, // by percent; if value = 1 the polygon has no transparency and show his color
      pane: "polygon"
    };
  } // stylePolygon

  printButton(param, map) {
    // Add a control to print leaflet map

    if (param === "init") {
      // add not-preselected layer to map -> shapeMarker is one of them
      L.Control.BrowserPrint.Utils.registerLayer(
        L.ShapeMarker,
        "L.ShapeMarker",
        (layer, utils) => {
          return L.shapeMarker(
            layer.getLatLng(),
            utils.cloneOptions(layer.options)
          );
        }
      );
    } else if (param === "add") {
      //add button to the map
      var printFunction = (context, mode) => {
        return () => {
          //if(mode.Mode !== 'Custom')
          $.blockUI({
            message: "<h2><span> Cargando impresión...</span></h2>"
          });

          // Slight delay to make sure BlockUI has time rendering the overlay.
          setTimeout(() => {
            if (mode.Mode === "Portrait") {
              context._printPortrait(mode);
            } else if (mode.Mode === "Landscape") {
              context._printLandscape(mode);
            } else if (mode.Mode === "Auto") {
              context._printAuto(mode);
              // }else if(mode.Mode === 'Custom'){
              // 	context._printCustom(mode);
            }
          }, 200);
        };
      };

      var customPrintFunction = (context, mode) => {
        return () => {
          // this.state.map.on('mouseup', () =>{
          // 	setTimeout(() => {
          // 		$.blockUI({ message: '<h2><span><img src="'+require('./images/rolling202.gif')+'" /> Cargando impresión...</span></h2>' });
          // 	}, 200);
          // });
          context._printCustom(mode);
        };
      };

      var printBtn = L.control.browserPrint({
        title: "Imprimir mapa",
        closePopupsOnPrint: false,
        printModes: [
          L.control.browserPrint.mode(
            "Portrait",
            "Vertical",
            "LETTER",
            printFunction,
            false
          ),
          L.control.browserPrint.mode(
            "Landscape",
            "Horizontal",
            "LETTER",
            printFunction,
            false
          ),
          L.control.browserPrint.mode(
            "Auto",
            "Automático",
            "LETTER",
            printFunction,
            false
          ),
          L.control.browserPrint.mode(
            "Custom",
            "Seleccionar la zona",
            "LETTER",
            customPrintFunction,
            true
          )
        ]
      });

      printBtn.addTo(map);

      map.on("browser-print-start", e => {
        //on print start we already have a print map and we can create new control and add it to the print map to be able to print custom information
        $.unblockUI();
      });
    } else if (param === "remove") {
      this.state.printButton.remove(this.state.map);
    }
  } //printButton

  addLegend() {
    // making current layer's info box
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      var div = L.DomUtil.create("div", "info legend"),
        namesExcep = ["No poblation", "No offer"],
        gradesExcep = ["0", null],
        gradesFloat = ["1", "26", "51", "76"],
        gradesTo = ["25", "50", "75", "100"],
        labels = ["<strong>LEGEND</strong>"],
        from,
        to;

      // Adding each line in the map control legend
      // Lines without range
      labels.push(
        '<i style="background:' +
          this.mapColor(gradesExcep[0]) +
          '"></i> ' +
          namesExcep[0]
      );
      labels.push(
        '<i style="background:' +
          this.mapColor(gradesExcep[1]) +
          '"></i> ' +
          namesExcep[1]
      );

      // Adding lines with range
      for (var i = 0; i < gradesFloat.length; i++) {
        from = gradesFloat[i];
        to = gradesTo[i];

        labels.push(
          '<i style="background:' +
            this.mapColor(from) +
            '"></i> ' +
            from +
            (to ? " &ndash; " + to : " + ")
        );
      }

      div.innerHTML = labels.join("<br>");
      return div;
    };

    this.setState({ legendControl: legend }, () => {
      this.state.legendControl.addTo(this.state.map);
    });
  } // addLegend

  removeLegend() {
    this.state.legendControl.remove(this.state.map);
  } // addsMap

  updateMap() {
    let indicatorName = $(
      'input[class="leaflet-control-layers-selector"]:checked'
    )
      .next()
      .html();
    indicatorName = indicatorName.substr(0, indicatorName.indexOf("&")); //everything before the ampersand (&)
    indicatorName = indicatorName.replace(/^\s+|\s+$/g, ""); //remove first and last space

    this.setState({ indicatorName });

    this.removeGeoJSONLayer();
    this.getData(indicatorName);
  }

  init(id) {
    if (this.state.map) return;

    let map = L.map(id, config.params);

    const tileLayer = L.tileLayer(
      config.tileLayer.uri,
      config.tileLayer.params
    ).addTo(map);

    this.setState({ map, tileLayer });

    map.createPane("polygon");
    map.getPane("polygon").style.zIndex = 400;

    L.control.zoom({ position: "topleft" }).addTo(map);
    L.control.scale({ position: "bottomleft" }).addTo(map);

    this.printButton("add", map);

    var options = {
      Option1: baselayer1
      //Option2: baselayer2
    };

    var overlayLayer = {
      Polygon: overlayerPolygon
    };

    L.control.layers(options, overlayLayer, { collapsed: false }).addTo(map);

    map.on("baselayerchange ", this.updateMap);
  } //init

  render() {
    return (
      <div id="mapUI">
        <div ref={node => (this._mapNode = node)} id="map" />
      </div>
    ); // return
  } //render
} //class BaseMap

export default BaseMap;
