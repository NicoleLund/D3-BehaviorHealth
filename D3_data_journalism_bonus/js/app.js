// Define SVG Area with help from
// https://www.d3-graph-gallery.com/graph/custom_responsive.html
// ==============================
var svgWidth = parseInt(d3.select("#scatter").style('width'),10);
console.log("svgWidth: " + svgWidth);
var svgHeight = 0.75*parseInt(d3.select("#scatter").style('width'),10);

var margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
};

// Define Chart Area
// ==============================
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper and group
// ==============================
var svg = d3.select("#scatter")
  .classed("chart", true)
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Import Data with headers:
// id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,
// healthcareHigh,obesity,obesityLow,obesityHigh,smokes,smokesLow,smokesHigh
// ==============================
d3.csv("data/data.csv").then(function(acsData) {
  // Cast data as numbers 
  // ==============================
  acsData.forEach(function(data) {
    data.id = +data.id;

    // x Axis Data
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;

    // y Axis Data (Average Values)
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;

    // y Axis Data (Low Values)
    data.healthcareLow = +data.healthcareLow;
    data.obesityLow = +data.obesityLow;
    data.smokesLow = +data.smokesLow;

    // y Axis Data (High Values)
    data.healthcareHigh = +data.healthcareHigh;
    data.obesityHigh = +data.obesityHigh;
    data.smokesHigh = +data.smokesHigh;

    // Margin of Error Data
    data.povertyMoe = +data.povertyMoe;
    data.ageMoe = +data.ageMoe;
    data.incomeMoe = +data.incomeMoe;
  });


  // Identify data of interest
  // ==============================
  var xToolTip = 'poverty';
  // var xToolTip = 'age';
  // var xToolTip = 'income';

  // var yToolTip = 'healthcare';
  // var yToolTip = 'obesity';
  var yToolTip = 'smokes';


  // Define selected data array
  // ==============================
  var selectedData = [];
  acsData.forEach(function(data) {
    selectedData.push({
        "abbr": data.abbr,
        "state": data.state
    });
  });
    
  acsData.forEach(function(data) {
    selectedData[selectedData.findIndex(obj => obj.abbr === data.abbr)].x = data[xToolTip];
  });

  acsData.forEach(function(data) {
    selectedData[selectedData.findIndex(obj => obj.abbr === data.abbr)].y = data[yToolTip];
  });


  // Define axis label font classes
  // ==============================
  var povertyLabel = 'inactive';
  var ageLabel = 'inactive';
  var incomeLabel = 'inactive';
  var healthcareLabel = 'inactive';
  var smokesLabel = 'inactive';
  var obeseLabel = 'inactive';

  // Define highlighted axis labels
  switch(xToolTip) {
    case "poverty":
      povertyLabel = 'active';
      var xAddendum = '%';
      break;
    case "age":
      ageLabel = 'active';
      var xAddendum = ' years old';
      break;
    case "income":
      incomeLabel = 'active';
      var xAddendum = ' USD';
      break;
  };

  switch(yToolTip) {
    case "healthcare":
      healthcareLabel = 'active';
      break;
    case "smokes":
      smokesLabel = 'active';
      break;
    case "obesity":
      obeseLabel = 'active';
      break;
  };

  // Build plot
  // ==============================

  // Create scale functions
  var xScale = d3.scaleLinear()
    .domain([d3.min(selectedData, d => d.x)-1,d3.max(selectedData, d => d.x)+1])
    .range([0, width]);

  var yScale = d3.scaleLinear()
    .domain([d3.min(selectedData, d => d.y)-1,d3.max(selectedData, d => d.y)+1])
    .range([height, 0]);

  // Create axis functions
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Append Axes to the chart
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  chartGroup.append("g")
    .call(yAxis);

  // Create Circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(selectedData)
    .enter()
    .append("circle")
    .attr("class","stateCircle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", "15");

  // Create Circle Labels
  var labelsGroup = chartGroup.selectAll("text")
    .data(selectedData)
    .enter().append("text")  
    .merge(circlesGroup)
    .attr("class","stateText")
    .attr("dx", d => xScale(d.x))
    .attr("dy", d => yScale(d.y) + 5)
    .text(function(d) {
        return d.abbr;
    });

  // Add Tool Tip Feature with mouseover actions
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([20, -60])
    .html(function(d) {
      return (`${d.state}<br>${xToolTip}: ${d.x}${xAddendum}<br>${yToolTip}: ${d.y}%`);
    });

  chartGroup.call(toolTip);

  circlesGroup
    .on("mouseover", function(d) {
      toolTip.show(d, this);
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });

  labelsGroup
    .on("mouseover", function(d) {
      toolTip.show(d, this);
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });

    
  // Add axes labels
  // ==============================
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 50)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", healthcareLabel)
    .text("Lacks Healthcare (%)");

  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 25)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", smokesLabel)
    .text("Smokes (%)");

  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", obeseLabel)
    .text("Obese (%)");

  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top - 60})`)
    .attr("class", povertyLabel)
    .text("In Poverty (%)");

  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top - 35})`)
    .attr("class", ageLabel)
    .text("Age (Median)");

  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top - 10})`)
    .attr("class", incomeLabel)
    .text("Household Income (Median)");

}).catch(function(error) {
  console.log(error);
});
