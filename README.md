# ARCGIS-WEB-APP
Interactive Web application to visualize the Feature Layer from the ArcGIS Rest Service by using ArcGIS JS API for JavaScript .The Application is used to  Visualize Crop Production Data.

# 🌽 [Corn Sales Visualization App](https://dpk-m.github.io/ARCGIS-WEB-APP/)

This is an interactive web GIS application built using the **ArcGIS JavaScript API (4.x)**. The app displays corn sales data across U.S. states, offering tools for analysis, interaction, and export.

---

## 🔍 Features

- 🗺️ **Map Visualization**: View corn sales data spatially with state-wise statistics.
- 📊 **Bar Chart**: Summarized corn sales by state using a dynamic Chart.js graph.
- 📋 **Attribute Table**: Explore all records in a tabular format with filtering.
- ✏️ **Sketch Tool**: Draw shapes to select and highlight features interactively.
- 🔍 **Search Widget**: Search for specific states or locations.
- 🖨️ **Print Widget**: Export the current map view as a printable layout.
- 📌 **Legend & Layer List**: Understand and control visible layers.
- 🧭 **Locate, Home, and ScaleBar**: Standard map navigation controls.
- 🌐 **Coordinate Conversion**: View coordinates in different formats.
- ℹ️ **Info Panel**: Understand how to use the app and its purpose.

---

## 🛠️ Technologies Used

- **ArcGIS JavaScript API (4.30)**
- **Chart.js** for dynamic bar charts
- **HTML, CSS, JavaScript**

---

## 🚀 How to Use

1. **View the Map**: The app initializes with a basemap and corn sales data layer.
2. **Explore Data**:
   - Use the **Layer List** to toggle layers.
   - Use the **Legend** to interpret map symbology.
3. **Sketch Selection**:
   - Draw a polygon to filter and highlight features.
   - Corresponding data is updated in the attribute table.
4. **Chart Insights**:
   - Expand the chart widget to view sales data comparison.
5. **Print Map**:
   - Use the print tool to download your current map view.

---

## 📈 Data Source

- [ArcGIS Online Feature Layer](https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Corn/FeatureServer/0)
- Field used:
  - `state_name`: Name of U.S. states
  - `CORN_SALES_IN_DOLLARS`: Aggregated corn sales per state

---

## 📜 License

This project is for educational and non-commercial demonstration purposes.  
For production use, please ensure compliance with [Esri terms of use](https://www.esri.com/en-us/legal/terms/full-master-agreement).

---

## 👨‍💻 Developer

**Deepak M**  
GIS Developer | Web Mapping Enthusiast  
📧 deepakvarun965@gmail.com
🌐 [LinkedIn](www.linkedin.com/in/deepak-m-giswafo)

---



