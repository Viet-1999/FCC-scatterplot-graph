// URL of the dataset (Cyclist data)
var datasetUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

// Select the SVG element and define margins and dimensions
var svg = d3.select("svg"),
  margin = { top: 50, right: 50, bottom: 100, left: 100 },
  width = svg.attr("width") - margin.left - margin.right,
  height = svg.attr("height") - margin.top - margin.bottom;

// Set the time format for the y-axis
var timeFormat = d3.timeFormat("%M:%S");
var timeParse = d3.timeParse("%M:%S");

// Add the colors to the dots
var color = d3.scaleOrdinal(d3.schemeCategory10);

// Create group element to hold the chart
var g = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Fetch the dataset using d3.json()
d3.json(datasetUrl).then(function (data) {
  var cyclistData = data;

  // Parse the Time field from "mm:ss" to a Date object for y-axis
  cyclistData.forEach(function (d) {
    d.Time = timeParse(d.Time);
    d.Place = +d.Place;
  });

  // Define the x and y scales based on the data
  var xScale = d3
    .scaleLinear()
    .domain([
      d3.min(cyclistData, (d) => d.Year - 1),
      d3.max(cyclistData, (d) => d.Year + 1),
    ]) // x-axis based on Year
    .range([0, width]);

  var yScale = d3
    .scaleTime()
    .domain([
      d3.min(cyclistData, (d) => d.Time),
      d3.max(cyclistData, (d) => d.Time),
    ]) // y-axis based on Time
    .range([height, 0]);

  // Add the x-axis
  g.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
    .append("text")
    .style("text-anchor", "end")
    .text("Year");

  // Add the y-axis
  g.append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(yScale).tickFormat(timeFormat))
    .append("text")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end")
    .text("Best Time (minutes)");

  // Create a Tooltip
  var tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip") // Set the ID to tooltip
    .style("opacity", 0)
    .style("position", "absolute") // Position it absolutely
    .style("background-color", "white")
    .style("border", "solid 1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("pointer-events", "none"); // Prevent the tooltip from capturing mouse events

  // Mouseover, mousemove, and mouseleave event handlers for tooltip
  var mouseover = function (event, d) {
    tooltip
      .html(
        `${d.Name}: ${d.Year} <br> ${timeFormat(d.Time)} minutes ${
          d.Doping ? "<br><br>" + d.Doping : ""
        }`
      )
      .style("opacity", 1)
      .attr("data-year", d.Year);
  };

  var mousemove = function (event) {
    tooltip
      .style("left", event.pageX + 10 + "px") // Move the tooltip to follow the mouse
      .style("top", event.pageY - 28 + "px");
  };

  var mouseleave = function () {
    tooltip.style("opacity", 0); // Hide the tooltip when the mouse leaves
  };

  // Add dots to the chart
  g.selectAll(".dot")
    .data(cyclistData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time.toISOString())
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) => yScale(d.Time))
    .attr("r", 5) // Set the radius of each dot
    .style("fill", (d) => color(d.Doping !== ""))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  // Create a legend
  var legendContainer = svg.append("g").attr("id", "legend");

  var legend = legendContainer
    .selectAll("#legend")
    .data(color.domain)
    .enter()
    .append("g")
    .attr("class", "legend-label")
    .attr("transform", function (d, i) {
      return "translate(0, " + (height / 2 - i * 20) + ")";
    });

  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {
      return d ? "Riders with doping allegations" : "No doping allegations";
    });
});
