chart("data/data.json");

function chart(path) {

var width = 900;
var height = width;

var format = d3.format(",d")

var color = d3.scaleOrdinal()
    .domain([0, 1])
    .range(["#1E2148", "#2A2D58", "#5A5D8D"])

var stars = d3.scaleOrdinal()
    .domain([0, 1])
    .range(["#D3B77A", "#9EC6F0", "#1D5A87", "#DE9951"])

function pack(data) {
   return d3.pack().size([width, height]).padding(8)
  (d3.hierarchy(data)
    .sum(function(d) {return Math.sqrt(d.value)} )
    .sort(function(a, b) {return (b.value - a.value)} ))
};


var graph = d3.json(path, function(data) {

  var root = pack(data);
  let focus = root;
  let view;

  var svg = d3.create("svg")
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .style("display", "block")
      .style("margin", "0px")
      .style("background", color(0))
      .style("cursor", "pointer")
      .on("click", () => zoom(root));
  
  var node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(4))
    .join("circle")
      .attr("fill", d => d.children ? color(d.depth) : "white")
      .attr("stroke", d => d.children ? null : stars(d.r))
      .attr("stroke-width", 2)
      .attr("pointer-events", d => !d.children ? "none" : null)
      .on("mouseover", on_mouseover)
      .on("mouseout", on_mouseout)
      .on("click", d => focus !== d && (zoom(d), d3.event.stopPropagation()));
      
  
  var label = svg.append("g")
    .style("font", "10px sans-serif")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants())
    .join("text")
      .style("fill-opacity", d => d.parent === root ? 1 : 0)
      .style("display", d => d.parent === root ? "inline" : "none")
      .text(d => d.children ? d.data.name.toUpperCase() : d.data.name.toUpperCase() + ": " + d.data.value)
      .attr("fill", d => d.children ? "white" : color(d.depth))
      .attr("dy", d => -d.r)
      .attr("font-family", "Skia")
      .style('font-size', 'small')
      .style("font-weight", "bold");
  
  zoomTo([root.x, root.y, root.r * 2]);
  
  var legend = svg.selectAll(".legend")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "legend")
  
  legend.append("text")
      .attr("x", -width/2.2)
      .attr("dy", -height/2.5)
      .attr("id", "title")
      .attr("font-family", "Skia")
      .style("font-size", "small")
      .style("font-weight", "bold");
  
  function on_mouseover(d) {
    d3.select(this).attr("stroke", "#7E81AD").attr("stroke-width", 2)
    d3.select('svg #title')
      .text(d.data.name.toUpperCase())      
      .style("fill", "white")  
      .transition()       
      .style('opacity', 1);
  }
  
  function on_mouseout(d) {
    d3.select(this).attr("stroke", null)
    d3.select('svg #title')      
      .transition()
      .duration(150)
      .style('opacity', 0);
  }
  
  function zoomTo(v) {
    const k = width / v[2];

    view = v;

    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("r", d => d.r * k);
  }
  
  function zoom(d) {
    const focus0 = focus;

    focus = d;

    const transition = svg.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", d => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return t => zoomTo(i(t));
        });
    
    function on_sets(d) {
      return (d.parent === focus &&
              focus.data.name !== "chemistry" &&
              focus.data.name !== "medicine" &&
              focus.data.name !== "physics");
    }
    
    function off_sets(d) {
      return (d.parent !== focus ||
              focus.data.name === "chemistry" ||
              focus.data.name === "medicine" ||
              focus.data.name === "physics");
    }
    
    label
      .filter(function(d) {return (on_sets(d) || this.style.display === "inline"); })
      .transition(transition)
        .style("fill-opacity", d => on_sets(d) ? 1 : 0)
        .on("start", function(d) { if (on_sets(d)) this.style.display = "inline"; })
        .on("end", function(d) { if (off_sets(d)) this.style.display = "none"; });
  }


});
}
