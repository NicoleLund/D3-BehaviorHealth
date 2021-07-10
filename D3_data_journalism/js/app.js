function updatePage(selectedItem) {

  // ==============================
  // Define displayed data
  // ==============================

  // Initial loaded data
  if (selectedItem ==="default") {
    var xToolTip = 'poverty';
    var yToolTip = 'healthcare';
  }
  // Retrieve current displayed data
  else {
    var activeData = [];
    d3.selectAll(".active").each(function (d) {
      activeData.push(d3.select(this).attr("id"));
    });
    xToolTip = activeData[0];
    yToolTip = activeData[1];
  };

  // Update data of interest with user selection
  switch(selectedItem) {
    case "poverty":
      xToolTip = 'poverty';
      break;
    case "age":
      xToolTip = 'age';
      break;
    case "income":
      xToolTip = 'income';
      break;
    case "healthcare":
      yToolTip = 'healthcare';
      break;
    case "smokes":
      yToolTip = 'smokes';
      break;
    case "obesity":
      yToolTip = 'obesity';
      break;
  };
  console.log("--------Selected Data----------");
  console.log("X Axis: " + xToolTip);
  console.log("Y Axis: " + yToolTip);


  // ==============================
  // Setup SVG Area
  // ==============================

  // Remove prior SVG
  d3.select("svg").remove();

  // Define new SVG Area with help from
  // https://www.d3-graph-gallery.com/graph/custom_responsive.html
  var svgWidth = parseInt(d3.select("#scatter").style('width'),10);
  // console.log("svgWidth: " + svgWidth);
  var svgHeight = 0.75*parseInt(d3.select("#scatter").style('width'),10);

  var margin = {
      top: 100,
      right: 100,
      bottom: 100,
      left: 100
  };

  // Define Chart Area
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper and group
  var svg = d3.select("#scatter")
    .classed("chart", true)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


  // ==============================
  // Import Data with headers:
  // id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,
  // healthcareHigh,obesity,obesityLow,obesityHigh,smokes,smokesLow,smokesHigh
  // ==============================
  d3.csv("data/data.csv").then(function(acsData) {

    // Cast imported data as numbers 
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

      // // y Axis Data (Low Values)
      // data.healthcareLow = +data.healthcareLow;
      // data.obesityLow = +data.obesityLow;
      // data.smokesLow = +data.smokesLow;

      // // y Axis Data (High Values)
      // data.healthcareHigh = +data.healthcareHigh;
      // data.obesityHigh = +data.obesityHigh;
      // data.smokesHigh = +data.smokesHigh;

      // // Margin of Error Data
      // data.povertyMoe = +data.povertyMoe;
      // data.ageMoe = +data.ageMoe;
      // data.incomeMoe = +data.incomeMoe;
    });
  
    // ==============================
    // Define selected data array to be plotted
    // ==============================
    var selectedData = [];
    acsData.forEach(function(data) {
      selectedData.push({
          "abbr": data.abbr,
          "state": data.state
      });
    });
    
    // Add x-axis data
    acsData.forEach(function(data) {
      selectedData[selectedData.findIndex(obj => obj.abbr === data.abbr)].x = data[xToolTip];
    });

    // Add y-axis data
    acsData.forEach(function(data) {
      selectedData[selectedData.findIndex(obj => obj.abbr === data.abbr)].y = data[yToolTip];
    });


    // ==============================
    // Define axis label font classes
    // ==============================

    // Initialize with default values
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


    // ==============================
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
      // .attr("cx", d => xScale(d.x)-2)
      // .attr("cy", d => yScale(d.y)+2)
      // .transition()
      // .duration(1000)
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

    chartGroup
      .on("mouseover", function(d) {
        toolTip.show(d, this);
      })
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });

    // labelsGroup
    //   .on("mouseover", function(d) {
    //     toolTip.show(d, this);
    //   })
    //   .on("mouseout", function(d) {
    //     toolTip.hide(d);
    //   });

      
    // Add axes labels
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top - 60})`)
      .attr("class", povertyLabel)
      .attr("id", "poverty")
      .text("In Poverty (%)")
      .on("click", function () {updatePage("poverty")});

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top - 35})`)
      .attr("class", ageLabel)
      .attr("id", "age")
      .text("Age (Median)")
      .on("click", function () {updatePage("age")});

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top - 10})`)
      .attr("class", incomeLabel)
      .attr("id", "income")
      .text("Household Income (Median)")
      .on("click", function () {updatePage("income")});
      
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 50)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", healthcareLabel)
      .attr("id", "healthcare")
      .text("Lacks Healthcare (%)")
      .on("click", function () {updatePage("healthcare")});

    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 25)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", smokesLabel)
      .attr("id", "smokes")
      .text("Smokes (%)")
      .on("click", function () {updatePage("smokes")});

    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", obeseLabel)
      .attr("id", "obesity")
      .text("Obese (%)")
      .on("click", function () {updatePage("obesity")});
    
  }).catch(function(error) {
    console.log(error);
  });
};

updatePage("default");