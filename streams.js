function filter(category){
  d3.select(".dropbtn").text(category);
  d3.selectAll("#svg_streams > *").remove()
  category = category.split(" ").join("_")
  var data_file = "data/" + category + "_data.csv"
  var data_file2 = "data/" + category + "_prizes.csv"
  var data_file3 = "data/" + category + "_discipline.csv"
  chart(data_file, data_file2, data_file3);
}

chart("data/california_institute_of_technology_data.csv",
      "data/california_institute_of_technology_prizes.csv",
      "data/california_institute_of_technology_discipline.csv")

function chart(csvpath, csvpath2, csvpath3) {

  var cat_dict = ["chemistry", "medicine", "physics"]

  var stars = d3.scaleOrdinal()
    .domain([0,1,2])
    .range(["#1D5A87", "#9EC6F0", "#DE9951"])

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

    var scatter = d3.csv(csvpath2, function(data2) {
      data2.forEach(function(d) {
        data2.columns.forEach(function(col) {
          d[col] = +d[col];
        });
      });

      var twinkle = d3.csv(csvpath3, function(data3) {
      data3.forEach(function(d) {
        data3.columns.forEach(function(col) {
          d[col] = +d[col];
        });
      });

        var stack = d3.stack()
          .keys(data.columns.slice(1))
          .offset(d3.stackOffsetWiggle)
          .order(d3.stackOrderInsideOut);

        var stack2 = d3.stack()
          .keys(data2.columns.slice(1))
          .offset(d3.stackOffsetWiggle)
          .order(d3.stackOrderInsideOut);

        var stack3 = d3.stack()
          .keys(data3.columns.slice(1))
          .offset(d3.stackOffsetWiggle)
          .order(d3.stackOrderInsideOut);

        var layers = stack(data);
        var layers2 = stack2(data2);
        var layers3 = stack2(data3);

        var steps = Math.ceil(data.columns.slice(1).length/2)
        var colorrange = d3.merge([d3.quantize(d3.interpolateRgb("#DE9951", "#1D4587"), steps).slice(0,steps-1), d3.quantize(d3.interpolateRgb("#1D4587", "#DE9951"), steps+1)])
        var z = d3.scaleOrdinal()
          .range(colorrange)
          .domain(data.columns.slice(1).map(function(d, i) {return i; }))

        x.domain(d3.extent(data, d => d.date));
        y.domain([d3.min(layers, d => d3.min(d, d => d[0])), d3.max(layers, d => d3.max(d, d => d[1]))]);

        var xdata = layers.map(d => d.map(d => d.data.date)).flat()
        var ydata = layers.map(d => d.map(d => (d[0]+d[1])/2)).flat()
        var keydata = layers.map(d => Array(layers[0].length).fill(d.key)).flat()
        
        var prizedata = layers2.map(d => d.map( d => d.data)).flat()
        var catdata = layers3.map(d => d.map(d => d.data)).flat()

        var layers2_list = Array(keydata.length).fill('')

        Array(keydata.length).fill().map((x,i)=>i).forEach(
          function (i) {
          layers2_list[i] = {key: keydata[i], x: x(xdata[i]), y: y(ydata[i]), value: prizedata[i][keydata[i]], cat: catdata[i][keydata[i]]};
          })

        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
              .attr("class", "layer")
              .attr("d", area)
              .style("fill", d => z(d.index));

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
            .attr("opacity", 0.8)
            
            .on("mouseover", function(d, i) {
              d3.select('#title')
              .html("<tspan x='10' dy='1.2em'>" + d.key.toUpperCase() + "</tspan>" + "<tspan x='10' dy='1.2em'>" + cat_dict[layers2_list.find(a => a.key === d.key).cat].toUpperCase() + "</tspan>")
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
              .attr("stroke-width", "0px");
              
            })

            .on("mouseout", function(d) {
              d3.select('#title')      
              .transition()
              .duration(150)
              .style('opacity', 0)

              svg.selectAll(".layer")
              .transition()
              .duration(150)
              .attr("opacity", 0.8)

              d3.select(this)
              .classed("hover", false)
              .attr("stroke-width", "0px");
            })

        svg.append("g")
          .selectAll("dot")
          .data(layers2_list)
          .enter().append("circle")               
             .attr("r", d => 3*Math.sqrt(d.value))   
             .attr("cx", d => d.x)
             .attr("cy", d => d.y)
             .attr("fill", "white")
             .attr("stroke-width", 2)
             .attr("stroke", d => stars(d.cat));
      });
    
    });

  });
}