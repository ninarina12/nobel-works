var basic_choropleth = new Datamap({
  element: document.getElementById("svg_map"),
  projection: 'mercator',
  fills: {
    defaultFill: "#CCCCCC",
    authorHasTraveledTo: "#ABDDA4"
  },
  data: {
    CHN: { fillKey: "authorHasTraveledTo", year: "1992 - 2014" },
    DEU: { fillKey: "authorHasTraveledTo", year: "2014" },
    USA: { fillKey: "authorHasTraveledTo", year: "2014 - 2017" },
    BHS: { fillKey: "authorHasTraveledTo", year: "2016" },
    CHL: { fillKey: "authorHasTraveledTo", year: "2017" }
  },
  geographyConfig: {
    popupTemplate: function(geo, data) {
        return ['<div class="hoverinfo"><strong>',
                'Country: ' + geo.properties.name,
                '<br> Year: ' + data.year,
                '</strong></div>'].join('');
    }
  }
});

// Add a legend to show the color of all categories included in the dataset
var legend = d3.select("#svg_map").append("svg").attr("id", "legend");
