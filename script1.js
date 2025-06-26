require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
   "esri/widgets/Print",
  "esri/widgets/Expand",
  "esri/widgets/BasemapGallery",
  "esri/widgets/LayerList",
  "esri/widgets/Locate",
  "esri/widgets/Home",
  "esri/widgets/ScaleBar",
  "esri/widgets/Search",
  "esri/widgets/Legend",
  "esri/widgets/Sketch",
   "esri/widgets/CoordinateConversion",
   "esri/widgets/Sketch/SketchViewModel",
   "esri/widgets/FeatureTable",
  "esri/rest/geoprocessor",
  "esri/Graphic", "esri/symbols/PictureMarkerSymbol", "esri/geometry/Point",
  "esri/layers/GraphicsLayer",
  "esri/widgets/FeatureTable",
  "esri/widgets/Sketch/SketchViewModel",
   "esri/core/reactiveUtils",
], function (
  Map,
  MapView,
  FeatureLayer,
  Print,
  Expand,
  BasemapGallery,
  LayerList,
  Locate,
  Home,
  ScaleBar,
  Search,
  Legend,
  Sketch,
  CoordinateConversion,
  FeatureTable,
  GraphicsLayer
) {

  
  // Create the map
  const map = new Map({
    basemap: "topo-vector",
    // layer:[imageLayer,graphicsLayer]
  });

  // Create the view
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [0, 0],
    zoom: 2
  });

  // Add FeatureLayer
  const imageLayer = new FeatureLayer({
    url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Corn/FeatureServer/0",
    // renderer: buildingTypeRenderer,
    outFields:["*"]
  });
  map.add(imageLayer);
  
  // Add GraphicsLayer for coordinate plotting
  const graphicsLayer = new GraphicsLayer();

  // Widgets setup
  const layerList = new LayerList({
    view: view,
    listItemCreatedFunction: (event) => {
      const item = event.item;
      item.actionsSections = [[{
        title: "Zoom to Layer",
        className: "esri-icon-zoom-in-magnifying-glass",
        id: "zoom-to-layer"
      }]];
    }
  });

  layerList.on("trigger-action", function (event) {
    const layer = event.item.layer;
    if (event.action.id === "zoom-to-layer") {
      layer.load().then(() => {
        if (layer.fullExtent) {
          view.goTo(layer.fullExtent);
        }
      });
    }
  });

   view.when(() => {
        const printWidget = new Print({
          view: view,
          printServiceUrl:
            "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
            includeTables:true
        });

        const printExpand = new Expand({
          view: view,
          content: printWidget,
          expandTooltip: "Print Map",
          expandIconClass: "esri-icon-printer"
        });

        view.ui.add(printExpand, "top-right");

        const layerExpand = new Expand({ view: view, content: layerList,expandTooltip:"layer List" });
        const basemapGallery = new BasemapGallery({ view: view });
        const basemapExpand = new Expand({ view: view, content: basemapGallery ,expandTooltip:"Basemap Gallery"});
        const locate = new Locate({ view: view });
        const home = new Home({ view: view });
        const scaleBar = new ScaleBar({ view: view, unit: "dual" });
        const searchWidget = new Search({view: view});
        view.ui.add(searchWidget,"top-right");

        const legend = new Legend({
          view: view,
          layerInfos: [
                    {
                      layer: imageLayer,
                      title: "SALES IN USD"
                    }
                  ]
        });
        const legendExpand = new Expand({ view: view, content: legend ,expandTooltip:"Legend"});
        
        const sketch = new Sketch({view: view,layer: graphicsLayer});
        view.ui.add(sketch,"top-right");

        const featureTable = new FeatureTable({
          view: view,
          layer: imageLayer,
          container: document.getElementById("attributeTableContainer")
        });

        const toggleTableButton = document.createElement("div");
          toggleTableButton.className = "esri-widget esri-widget--button esri-interactive";
          toggleTableButton.title = "Toggle Attribute Table";
          toggleTableButton.innerHTML = `<span class="esri-icon-table"></span>`;

          view.ui.add(toggleTableButton, "top-right");

          toggleTableButton.onclick = function () {
          const container = document.getElementById("attributeTableContainer");
          const isVisible = container.style.display !== "none";

          container.style.display = isVisible ? "none" : "block";
          };


        sketch.on("create", function(event) {
        if (event.state === "complete") {
          graphicsLayer.remove(event.graphic);
          selectFeatures(event.graphic.geometry);
            }
          });

            sketch.visibleElements = {
            createTools: {
              point: false,
              circle: false
            },
            selectionTools:{
              "lasso-selection": false
            },
            settingsMenu: false
          }

          let highlightHandle = null;
          
          // Function to select intersecting features from the FeatureLayer
          function selectFeatures(geometry) {
            const query = imageLayer.createQuery();
            query.geometry = geometry;
            query.spatialRelationship = "intersects"; // "contains", "within", etc.
            query.returnGeometry = true;
            query.outFields = ["*"];

            imageLayer.queryFeatures(query).then(function(results) {
              if (results.features.length > 0) {
                console.log("Features selected:", results.features);

                // Optional: highlight them on the map
                view.whenLayerView(imageLayer).then(function(layerView) {
                  if (highlightHandle) {
                    highlightHandle.remove();
                    highlightHandle = null;
                  }
                  const objectIdField = imageLayer.objectIdField || "OBJECTID";
                  const objectIds = results.features.map((f) => f.attributes[objectIdField]);
                  highlightHandle = layerView.highlight(objectIds);

                });

                featureTable.filterGeometry = geometry;

                // Optional: Zoom to the selected features
                view.goTo(results.features);
              } else {
                alert("No features found in the drawn area.");
              }
            }).catch(function(error) {
              console.error("Query failed: ", error);
            });
          }

          const clearButton = document.createElement("div");
          clearButton.className = "esri-widget esri-widget--button esri-interactive";
          clearButton.title = "Clear Sketch and Selection";
          clearButton.innerHTML = `<span class="esri-icon-trash"></span>`;

          clearButton.onclick = () => {
            // Clear drawn graphics
            graphicsLayer.removeAll();
            featureTable.filterGeometry = imageLayer;
            sketch.cancel();
            
            // Clear highlights
            view.whenLayerView(imageLayer).then((layerView) => {
              layerView.filter = null;
              if (highlightHandle) {
                highlightHandle.remove();
                highlightHandle = null;
              };
              layerView.filter = null;
            });
          };

          view.ui.add(clearButton, "top-right");

          const coordConversion = new CoordinateConversion({view: view});
          const coordConversionExpand = new Expand({ view: view, content: coordConversion,expandTooltip:"Coordinate Search" });
          const infoContent = document.createElement("div");
            infoContent.innerHTML = `
              <h3>📍 About This App</h3>
              <p>This interactive web GIS tool allows you to visualize corn sales data across U.S. states. Features include:</p>
              <ul>
                <li>🔍 Search by state or location</li>
                <li>🖍️ Sketch to filter features</li>
                <li>📊 View sales chart and attribute table</li>
                <li>🖨️ Export and print the map</li>
              </ul>
              <p><small>Built using ArcGIS JS API 4.x</small></p>
            `;
            infoContent.style.padding = "10px";
            infoContent.style.width = "280px";

          const infoExpand = new Expand({
            view: view,
            content: infoContent,
            expandTooltip: "About this App",
            expandIcon: "applications",
            expanded:true
          });

          view.ui.add(infoExpand, "top-left");


        
          view.ui.add(layerExpand, "top-left");
          view.ui.add(basemapExpand, "top-left");
          view.ui.add(locate, "top-left");
          view.ui.add(home, "top-left");
          view.ui.add(scaleBar, "bottom-left");
          view.ui.add(legendExpand, "top-left");
          view.ui.add(coordConversionExpand, "top-left");
          // view.ui.add(featureTable, "bottom");

            // Only one Expand open at a time Functionality customization
            const expandWidgets = [layerExpand, basemapExpand,legendExpand,coordConversionExpand];

              expandWidgets.forEach((widget) => {
                widget.watch("expanded", (newVal) => {
                  if (newVal) {
                    expandWidgets.forEach((other) => {
                      if (other !== widget) {
                        other.expanded = false;
                      }
                    });
                  }
                });
              });

              document.addEventListener("click", (event) => {
                const inside = expandWidgets.some(widget => {
                  const container = widget.container;
                  const button = widget.domNode;
                  return widget.expanded && (container?.contains(event.target) || button?.contains(event.target));
                });

                if (!inside) {
                  expandWidgets.forEach(widget => widget.expanded = false);
                }
              });

              

              //Custom Popup
            imageLayer.popupTemplate = {
                title: "Info Window",
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      {
                        fieldName: "state_name",
                        label: "State name"
                      },
                      {
                        fieldName: "county_name",
                        label: "Country name"
                      },
                      
                      {
                        fieldName: "CORN_SALES_IN_DOLLARS",
                        label: "Corn Sale in USD",
                        format: {
                        places: 2,
                        digitSeparator: true
                      }
                      }
                    ]
                  }
                ]
              };

      
              const chartContainer = document.createElement("div");
              chartContainer.id = "chartContainer";
              chartContainer.style.width = "100%";
              chartContainer.style.height = "auto";
              chartContainer.style.backgroundColor = "white";
              const canvas = document.createElement("canvas");
              canvas.width = 600;
              canvas.height = 400;
              canvas.id = "barChart";
              chartContainer.appendChild(canvas);
              const ctx = canvas.getContext("2d");
              

              const chartExpand = new Expand({
                view: view,
                content: chartContainer,
                expandTooltip: "Sale Chart",
                expandIcon:"graph-bar"
              });
              
              view.ui.add(chartExpand, "top-right");

            // Wait for layer to load, then query
            imageLayer.when(() => imageLayer.loaded).then(() => {
              const query = imageLayer.createQuery();
              query.outStatistics = [{where:"1=1",onStatisticField: "CORN_SALES_IN_DOLLARS",outStatisticFieldName: "total_CORN_SALES_IN_DOLLARS",statisticType: "SUM"}];
              query.groupByFieldsForStatistics = ["state_name"];
              query.orderByFields = ["total_CORN_SALES_IN_DOLLARS DESC"];

              imageLayer.queryFeatures(query).then((result) => {
                const label = [];
                const value = [];

                // Get domain for state_name
                const domain = imageLayer.getFieldDomain("state_name");
                const codedValues = domain?.codedValues || [];

                // Helper to convert code to description
                function getDescription(code) {
                  const match = codedValues.find(d => d.code === code);
                  return match ? match.name : code;
                }

                // Fill chart data arrays
                result.features.forEach(feature => {
                  const attr = feature.attributes;
                  // console.log("Feature attributes:", attr);

                  label.push(getDescription(attr.state_name));
                  // console.log("label value ",label);

                  value.push(attr.total_CORN_SALES_IN_DOLLARS);
                  // console.log(" value ",value);
                });

              if (ctx) {
                new Chart(ctx, {
                  type: "bar",
                  data: {
                    labels:label ,
                    datasets: [{
                      label: "Tax Due by Building Type",
                      data: value,
                      backgroundColor: "rgba(54, 162, 235, 0.6)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      borderWidth: 1
                    }]
                  },
                  options: {
                    layout: {
                      padding: {
                        left: 15, // increase for more space near y-axis
                        right: 15,
                        top: 10,
                        bottom: 10
                      }
                    },
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: "CORN SALES IN DOLLARS STATE WISE DATA",
                        font: {
                            size: 16,
                            weight: "bold"
                          }
                      },
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "STATE NAME",
                          font: {
                            size: 13,
                            weight: "bold"
                          },
                          
                        },
                        ticks: {
                          maxRotation: 90,
                          minRotation: 45
                        }
                      },
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "CORN SALES IN DOLLARS",
                          font: {
                            size: 13,
                            weight: "bold"
                          }
                        },
                        ticks: {
                            padding: 10  
                            ,font: {
                                size: 9
                              },
                              callback: function(value) {
                                return "$ " + value.toLocaleString(); 
                              }
                          },
                      }
                    }
                  }
                });
              } else {
                console.error("Canvas with ID 'myChart' not found.");
              }
          });
        });
     });
});





