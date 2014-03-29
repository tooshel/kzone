var margin = {top: 10, right: 10, bottom: 40, left: 30},
    width = 320 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(4, "C");


function drwaChart(d, id, div, chartlabel, chartvalue, chartDesc){

  x.domain(d.map(function(d) { return d[chartlabel]; }))
  y.domain([d3.min(d, function(d) { return d[chartvalue]-5; }), d3.max(d, function(d) { return d[chartvalue]; })]);

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 20])
  .html(function(d) {
    return "<strong>" + d[chartDesc] + " :</strong> <span style='color:red'>" + d[chartvalue] + "</span>";
  });

  var svg = d3.select(div).append("svg")
    .attr("id", id)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.call(tip);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
      // .selectAll("text")  
      //   .style("text-anchor", "end")
      //   .attr("dx", "-.8em")
      //   .attr("dy", ".15em")
      //   .attr("transform", function(d, i) {
      //       return "rotate(-30)" 
      //       });

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");
      // .text("Temperature (C)");

  svg.selectAll(".bar")
      .data(d)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d[chartlabel]); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d[chartvalue]); })
      .attr("height", function(d) { return height - y(d[chartvalue]); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

}

