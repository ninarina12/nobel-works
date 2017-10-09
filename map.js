var sample_data = [
    {"year": "1994", "country": "eusrb", "name": "Serbia", "tags": "birth country", "color": "#ABDDA6"},
    {"year": "2009", "country": "eufra", "name": "France", "tags": "travel", "color": "#ABDDA4"},
    {"year": "2010", "country": "namex", "name": "Mexico", "tags": "travel", "color": "#ABDDA4"},
    {"year": "2014", "country": "euita", "name": "Italy", "tags": "travel", "color": "#ABDDA4"},
    {"year": "2017", "country": "nausa", "name": "United States", "tags": "research", "color": "#ABDDA4"}
];

// Add a tooltip to show the year and the tags fields from your dataset
var visualization = d3plus.viz()
    .container("#svg_map")        // container DIV to hold the visualization
    .data(sample_data)            // data to use with the visualization
    .coords({
        "mute": ["anata"],
        "value": "http://d3plus.org/topojson/countries.json"
    })                            // pass topojson coordinates
    .type("geo_map")              // visualization type
    .id("country")                // key for which our data is unique on
    .text("name")                 // key to use for display text
    .color("color")               // key for coloring countries
    .tooltip(['year','tags'])
    .draw();                      // finally, draw the visualization!
