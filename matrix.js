matrix_chart("data/selected_prizes.csv")

function matrix_chart(csvpath) {

  var groups = ['california institute of technology', 'columbia university', 'cornell university',
                'harvard university', 'massachusetts institute of technology', 'max planck society',
                'princeton university', 'rockefeller university', 'stanford university',
                'university of cambridge', 'university of chicago', 'yale university']

  var margin = 20;
  var width = 960 - 2*margin;
  var height = 720 - 2*margin;
  var size = 0.9*(width - 5*margin)/4 + margin;

  var svg = d3.select("body").select("#svg_matrix")
      .attr("width", width + 2*margin)
      .attr("height", height + 2*margin)
    .append("g")
      .attr("transform", "translate(" + 3*margin + "," + margin + ")");

  var x = groups.slice(0,4).map(c => d3.scaleLinear()
      .domain([1892, 2019])
      .rangeRound([margin/2, size - margin/2]))

  var y = groups.slice(0,3).map(c => d3.scaleLinear()
      .domain([1892, 2019])
      .range([size - margin/2, margin/2]));

  var axisbot = d3.axisBottom()
      .ticks(5)
      .tickSize(size*3)
      .tickFormat(d3.format("d"));

  var axisleft = d3.axisLeft()
      .ticks(5)
      .tickSize(-size*3)
      .tickFormat(d3.format("d"));

  var xAxis = g => g.selectAll("g").data(x).enter().append("g")
      .attr("transform", (d, i) => `translate(${i * size - width/1.65},350)`)
      .each(function(d) { return d3.select(this).call(axisbot.scale(d)); })
      .attr("font-family", "Skia")
      .attr("font-size", "12px")
      .style("stroke", "white")
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke-width", 0))
      .selectAll("text")  
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");

  var yAxis = g => g.selectAll("g").data(y).enter().append("g")
      .attr("transform", (d, i) => `translate(0,${i * size})`)
      .each(function(d) { return d3.select(this).call(axisleft.scale(d)); })
      .attr("font-family", "Skia")
      .attr("font-size", "12px")
      .style("stroke", "white")
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke-width", 0));

  function brush(cell, circle) {
    const brush = d3.brush()
        .extent([[margin/2, margin/2], [size - margin/2, size - margin/2]])
        .on("start", brushstarted)
        .on("brush", brushed)
        .on("end", brushended);

    cell.call(brush);

    let brushCell;

    // Clear the previously-active brush, if any.
    function brushstarted() {
      if (brushCell !== this) {
        d3.select(brushCell).call(brush.move, null);
        brushCell = this;
      }
    }

    // Highlight the selected circles.
    function brushed([i, j]) {
      if (d3.event.selection === null) return;
      const [[x0, y0], [x1, y1]] = d3.event.selection; 
      circle.classed("hidden", d => {
        return x0 > x[i](d.pub)
            || x1 < x[i](d.pub)
            || y0 > y[j](d.prize)
            || y1 < y[j](d.prize);
      });
    }

    // If the brush is empty, select all circles.
    function brushended() {
      if (d3.event.selection !== null) return;
      circle.classed("hidden", false);
    }
  }

  var graph = d3.csv(csvpath, function(data) {

    var xdata = data.map(d => +d.pub).flat()
    var ydata = data.map(d => +d.prize).flat()

    var z = d3.scaleOrdinal()
        .domain(data.map(d => d.discipline))
        .range(["#1D5A87", "#9EC6F0", "#DE9951"])

    svg.append("style")
      .text(`circle.hidden { fill: #000; fill-opacity: 1; r: 1px; }`);

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    var x_label = svg.selectAll(".labelx")
      .data(xdata.slice(0,1))
      .enter().append("g")
      .append("text")
        .attr("text-anchor", "middle")
        .attr("x", width/2 - 2.6*margin)
        .attr("y", 0.72*width)
        .attr("font-family", "Skia")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text("publication year");

    var y_label = svg.selectAll(".labely")
      .data(ydata.slice(0,1))
      .enter().append("g")
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("x", -width/3)
        .attr("y", -2.5*margin)
        .attr("font-family", "Skia")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text("prize year");

    var cell = svg.append("g")
      .selectAll("g")
      .data(d3.cross(d3.range(4), d3.range(3)))
      .enter().append("g")
        .attr("transform", ([i, j]) => `translate(${i*size},${j*size})`);
    
    cell.append("text")
      .attr("transform", "translate(" + size/2 + " ," + 5 + ")")
      .style("text-anchor", "middle")
      .text(function([i, j]) {return groups[4*j+i]})
      .attr("font-family", "Skia")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "white");
    
    cell.append("rect")
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("x", margin/2 + 0.5)
        .attr("y", margin/2 + 0.5)
        .attr("width", size - margin)
        .attr("height", size - margin);

    cell.each(function([i, j]) {
      d3.select(this).selectAll("circle")
        .data(data)
        .enter().append("circle")
          .attr("cx", d => d.affiliation === groups[4*j+i] ? x[i](d.pub) : -1E10)
          .attr("cy", d => d.affiliation === groups[4*j+i] ? y[j](d.prize) : -1E10)
          .attr("r", d => d.affiliation === groups[4*j+i] ? 5 : 0);
    });

    var circle = cell.selectAll("circle")
        .attr("stroke", d => z(d.discipline))
        .attr("fill", "white")
        .attr("stroke-width", 2);

    cell.call(brush, circle);

  });
}