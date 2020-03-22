chart("data/test_data.csv", "blue");

var colorrange = [];

function chart(csvpath, color) {

if (color == "blue") {
  colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
}
else if (color == "pink") {
  colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
}
else if (color == "orange") {
  colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
}
strokecolor = colorrange[0];

var margin = 50;
var svg = d3.select("body").select("#svg_streams")
    //.attr("width", width + margin + margin)
    //.attr("height", height + margin + margin)
  .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");

var diameter = +svg.attr("width");
var height = +svg.attr("height");

var x = d3.scaleLinear()
    .range([margin, width - margin]);

var y = d3.scaleLinear()
    .range([height - margin, margin]);

var z = d3.scaleOrdinal()
    .range(colorrange);

var xAxis = g => g
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
    //.call(g => g.select(".domain").remove())

var area = d3.area()
    .curve(d3.curveCardinal)
    .x(function(d) { return x(d.data.date); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

var graph = d3.csv(csvpath, function(data) {
  data.forEach(function(d) {
    data.columns.forEach(function(col) {
      d[col] = +d[col];
    });
  });

  var stack = d3.stack()
    .keys(data.columns.slice(1))
    .offset(d3.stackOffsetWiggle)
    .order(d3.stackOrderInsideOut);

  var layers = stack(data);

  x.domain(d3.extent(data, d => d.date));
  y.domain([d3.min(layers, d => d3.min(d, d => d[0])), d3.max(layers, d => d3.max(d, d => d[1]))]);
  z.domain(data.columns.slice(1));

  svg.selectAll(".layer")
      .data(layers)
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", area)
        .style("fill", ({key}) => z(key));


  svg.append("g")
      .attr("class", "x axis")
      .style("stroke", "white")
      .call(xAxis);

  svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function(d, i) {
        svg.selectAll(".layer").transition()
        .duration(250)
        .attr("opacity", function(d, j) {
          return j != i ? 0.6 : 1;
      })})

    .on("mousemove", function(d) {
      d3.select(this)
      .classed("hover", true)
      .attr("stroke", strokecolor)
      .attr("stroke-width", "0.5px");
      
    })

    .on("mouseout", function(d) {
     svg.selectAll(".layer")
      .transition()
      .duration(250)
      .attr("opacity", "1");
      d3.select(this)
      .classed("hover", false)
      .attr("stroke-width", "0px");
  })
});
}