function makeResponsive () {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

var svgWidth = window.innerWidth * 0.5;
var svgHeight = window.innerHeight * 0.6;


var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv")
  .then(function (healthData) {
    console.log(healthData);
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function (data) {
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3
      .scaleLinear()
      .domain([8.5, d3.max(healthData, (d) => d.poverty)])
      .range([0, width]);

    var yLinearScale = d3
      .scaleLinear()
      .domain([4, d3.max(healthData, (d) => d.healthcare)])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g").call(leftAxis);

    // Step 5: Create Circles
    // ==============================

    var radiusSize = svgWidth * 0.02; // Font and radius depend on svgWidth
    
    var circlesGroup = chartGroup
      .selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", (d) => xLinearScale(d.poverty))
      .attr("cy", (d) => yLinearScale(d.healthcare))
      .attr("r", radiusSize)

    // Bind nodes data to what will become DOM elements to represent them.
    var textGroup = chartGroup.selectAll('circles')
      .data(healthData)
      .enter()
      .append('g')
      .attr("transform", d => `translate(${xLinearScale(d.poverty)}, ${yLinearScale(d.healthcare)})`)

    texts = textGroup.append('text')
      .classed("stateText", true)
      .attr('alignment-baseline', 'middle')
        .style('font-size', radiusSize * 0.75) // font size = three-quaters of radius
      .text(d => d.abbr)
    
    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (d) {
        return `${d.state}<br>Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`;
      });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup
      .on("mouseover", function (data) {
        toolTip.show(data, this);
        // d3.select(this).classed("active", true)
      })
      // onmouseout event
      .on("mouseout", function (data, index) {
        toolTip.hide(data);
        // d3.select(this).classed("inactive", true)
      });

    // Create axes labels
    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("class", "aText active")
      .text("Lacks Healthcare (%)");

    chartGroup
      .append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "aText active")
      .text("In Poverty (%)");
  })
  .catch(function (error) {
    console.log(error);
  });
}
  // When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);