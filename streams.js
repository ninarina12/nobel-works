var basic_choropleth = new Datamap({
  element: document.getElementById("svg_streams"),
  projection: 'mercator',
  fills: {
    defaultFill: "#CCCCCC",
    authorHasTraveledTo: "#ABDDA4",
    authorHasStudiedIn: "#AB55A4"
  },
  data: {
    CHN: { fillKey: "authorHasStudiedIn", year: "1992 - 2014" },
    DEU: { fillKey: "authorHasTraveledTo", year: "2014" },
    USA: { fillKey: "authorHasStudiedIn", year: "2014 - 2017" },
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
var legend = d3.select("#svg_streams").append("svg").attr("id", "legend");
legend.append("rect").attr("x", "200").attr("y", "10").attr("width", "20").attr("height", "20").attr("fill", "#ABDDA4");
legend.append("text").attr("x", "225").attr("y", "24").attr("font-size", "12px").text("Traveled to");
legend.append("rect").attr("x", "350").attr("y", "10").attr("width", "20").attr("height", "20").attr("fill", "#AB55A4");
legend.append("text").attr("x", "375").attr("y", "24").attr("font-size", "12px").text("Studied in");
