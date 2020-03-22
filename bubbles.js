var svg = d3.select("body").select("#svg_bubbles"),
    margin = 10,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scaleOrdinal()
    .domain([0, 1])
    .range(["#1E2148", "#2A2D58", "#5A5D8D"]);

var stars = d3.scaleOrdinal()
    .domain([0, 1])
    .range(["#D3B77A", "#9EC6F0", "#1D5A87", "#DE9951"])

var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(function(d) {return 12 - d.depth});

d3.json("data/data.json", function(error, root) {
  if (error) throw error;

  root = d3.hierarchy(root)
      .sum(function(d) { return Math.sqrt(d.value); })
      .sort(function(d) { return d.depth - Math.sqrt(d.value); });

  var focus = root,
      nodes = pack(root).descendants(),
      view;

  var circle = g.selectAll("circle")
    .data(nodes.slice(4))
    .enter().append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) { return d.children ? color(d.depth) : null; })
      .style("stroke", function(d) { return d.children ? null : stars(d.r); })
      .style("stroke-width", 2)
      .on("mouseover", on_mouseover)
      .on("mouseout", on_mouseout)
      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

  var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      //.text(function(d) { return d.children ? d.data.name.toUpperCase() : d.data.name.toUpperCase() + ": " + d.data.value; })
      .html(d => d.children ? d.data.name.toUpperCase() : "<tspan x='0' dy='1.2em'>" + d.data.name.toUpperCase() + "</tspan>" + "<tspan x='0' dy='1.2em'>" +d.data.value + "</tspan>")
      .style("fill", function(d) { return d.children ? "white" : color(d.depth); })
      .style("text-shadow", function(d) { return d.children ? null : "0 1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff, 0 -1px 0 #fff, 1px 1px 0 #fff, -1px -1px 0 #fff, -1px 1px 0 #fff, 1px -1px 0 #fff"; })
      .attr("dy", function(d) { return -d.r; });

  var legend1 = svg.selectAll(".legend1")
      .data(nodes)
      .enter().append("g")
        .attr("class", "legend1")
        .append("text")
          .attr("x", 50)
          .attr("dy", 50)
          .attr("id", "title1")
          .style("text-shadow", "0 1px 0 #1E2148, 1px 0 0 #1E2148, -1px 0 0 #1E2148, 0 -1px 0 #1E2148, 1px 1px 0 #1E2148, -1px -1px 0 #1E2148, -1px 1px 0 #1E2148, 1px -1px 0 #1E2148");

  var legend2 = svg.selectAll(".legend2")
      .data(nodes)
      .enter().append("g")
        .attr("class", "legend2")
        .append("text")
          .attr("x", diameter - 50)
          .attr("dy", diameter - 50)
          .attr("id", "title2")
          .style("text-shadow", "0 1px 0 #1E2148, 1px 0 0 #1E2148, -1px 0 0 #1E2148, 0 -1px 0 #1E2148, 1px 1px 0 #1E2148, -1px -1px 0 #1E2148, -1px 1px 0 #1E2148, 1px -1px 0 #1E2148");

  //var node = g.selectAll("circle,text");

  svg
      .style("background", color(0))
      .on("click", function() { zoom(root); });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    circle.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    text.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1] - 10) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }

  function on_mouseover(d) {
    d3.select('svg #title1')
      .text(d.data.name.toUpperCase())      
      .style("fill", "white")  
      .transition()       
      .style('opacity', 1)
    d3.select('svg #title2')
      .text(d.data.name.toUpperCase())      
      .style("fill", "white")  
      .transition()       
      .style('opacity', 1);
  }
  
  function on_mouseout(d) {
    d3.select('svg #title1')      
      .transition()
      .duration(150)
      .style('opacity', 0)
    d3.select('svg #title2')      
      .transition()
      .duration(150)
      .style('opacity', 0);
  }
});