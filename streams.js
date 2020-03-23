function filter(category){
  d3.select(".dropbtn").text(category);
  d3.selectAll("#svg_streams > *").remove()
  var data_file = "data/" + category + "_data.csv"
  chart(data_file, "pink");
}

chart("data/chemistry_data.csv", "pink")

function chart(csvpath, color) {
  var colorrange = [];

  if (color == "blue") {
    colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
  }
  else if (color == "pink") {
    colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
  }
  else if (color == "orange") {
    colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
  }

  var strokecolor = "#1E2148"
  var margin = 20;
  var width = 960 - 2*margin;
  var height = 500 - 2*margin;

  var svg = d3.select("body").select("#svg_streams")
      .attr("width", width + 2*margin)
      .attr("height", height + 2*margin)
    .append("g")
      .attr("transform", "translate(" + margin + "," + margin + ")");

  var x = d3.scaleLinear()
      .range([margin, width - margin]);

  var y = d3.scaleLinear()
      .range([height - margin, margin]);

  var xAxis = g => g
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(9).tickSizeOuter(0).tickFormat(d3.format("d")))

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

    var steps = Math.ceil(data.columns.slice(1).length/2)
    var colorrange = d3.merge([d3.quantize(d3.interpolateRgb("#DE9951", "#383FAF"), steps), d3.quantize(d3.interpolateRgb("#383FAF", "#DE9951"), steps)])
    var z = d3.scaleOrdinal()
      .range(colorrange)
      .domain(data.columns.slice(1).map(function(d, i) {return i; }))

    x.domain(d3.extent(data, d => d.date));
    y.domain([d3.min(layers, d => d3.min(d, d => d[0])), d3.max(layers, d => d3.max(d, d => d[1]))]);

    svg.selectAll(".layer")
        .data(layers)
        .enter().append("path")
          .attr("class", "layer")
          .attr("d", area)
          .style("fill", d => z(d.index))
          .attr("stroke", strokecolor)
          .attr("stroke-width", "2px");

    var legend = svg.selectAll(".legend")
        .data(layers)
        .enter().append("g")
        .append("text")
          .attr("text-anchor", "start")
          .attr("x", 2*margin)
          .attr("dy", margin)
          .attr("id", "title")
          .style("text-shadow", "0 1px 0 #1E2148, 1px 0 0 #1E2148, -1px 0 0 #1E2148, 0 -1px 0 #1E2148, 1px 1px 0 #1E2148, -1px -1px 0 #1E2148, -1px 1px 0 #1E2148, 1px -1px 0 #1E2148")
          .attr("font-family", "Skia")
          .style("font-size", "12px")
          .style("font-weight", "bold");

    svg.append("g")
        .attr("class", "axis")
        .style("stroke", "#fff")
        .call(xAxis);

    svg.selectAll(".layer")
        .attr("opacity", 1)
        
        .on("mouseover", function(d, i) {
          d3.select('#title')
          .text(d.key.toUpperCase())      
          .style("fill", "white")  
          .transition()       
          .style('opacity', 1)

          svg.selectAll(".layer").transition()
          .duration(150)
          .attr("opacity", function(d, j) {
            return j != i ? 0.4 : 1; })
        })

        .on("mousemove", function(d) {
          d3.select(this)
          .classed("hover", true)
          .attr("stroke", strokecolor)
          .attr("stroke-width", "0.5px");
          
        })

        .on("mouseout", function(d) {
          d3.select('#title')      
          .transition()
          .duration(150)
          .style('opacity', 0)

          svg.selectAll(".layer")
          .transition()
          .duration(150)
          .attr("opacity", 1)

          d3.select(this)
          .classed("hover", false)
          .attr("stroke-width", "0px");
        })

    var scatter = d3.csv(csvpath, function(data2) {
      data2.forEach(function(d) {
        data2.columns.forEach(function(col) {
          d[col] = +d[col];
        });
      });
    });

  });
}