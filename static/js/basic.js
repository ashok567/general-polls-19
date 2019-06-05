
$('body')    
// Anything with a title= or data-title= attribute will be shown as a tooltip
.tooltip({selector: '[title],[data-title],[data-original-title]', container: 'body', html: true, animated: 'fade'})

var margin = {top: 20, right: 160, bottom: 35, left: 30};

var width  = 550 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// d3.csv('static/data/data.csv', function(data){console.log(data);});

$('.dropdown-menu').on('click', '.dropdown-item' ,function(){
  var selected_year = $(this).text();
  $.ajax({
    type: "GET",
    url: '/data',
  })
  .done(function(data){
    res_data = data.response;
    
    var year_dataset = _.filter(res_data, function(res){
      return res.YEAR == selected_year; 
    });

    var pollsters = _.map(year_dataset, 'POLLSTERS');
    
    var party  =  ['NDA','UPA','OTHERS']
    var colors =  ['#FF4500','#32CD32',"#6495ED"]

    /* Data in strings like it would be if imported from a csv */

    var stack = d3.stack().keys(party)

    var dataset = stack(year_dataset)

    $('#canvas1').empty();
    // $('#canvas2').empty();
    var svg = d3.selectAll("#canvas1")
    .append("svg")
    .attr("width", width + 2*margin.left + 2*margin.right)
    .attr("height", height + 2*margin.top + 2*margin.bottom)
    .append("g")
    .attr("transform", "translate(" + 2*margin.left + "," + 2*margin.top + ")");

    // Set x, y and colors
    var x = d3.scaleBand()
      .domain(pollsters.map(function(d) { return d; }))
      .range([10, width-10], 0.02);

    var y = d3.scaleLinear()
      // .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d[1]; });  })])
      .domain([0,600]).range([height, 0]);

    // Define and draw axes
    var yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickSize(-width, 0, 0)
      .tickFormat( function(d) { return d } );

    var xAxis = d3.axisBottom(x)

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);


    // Create groups for each series, rects for each segment 
    var groups = svg.selectAll("g.cost")
      .data(dataset)
      .enter().append("g")
      .attr("class", "cost")
      .style("fill", function(d, i) { return colors[i]; });

    console.log(_.each(dataset, function(d){ return d } ))

    var rect = groups.selectAll("rect")
      .data(function(d) { return d; })
      .enter()
      .append("rect") 
      .attr("x", function(d) { return x(d.data.POLLSTERS) })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth()-15)
      .attr('data-placement', 'right')
      .attr('data-toggle', 'popover')
      .attr('data-title', function(d){
        return d[1]-d[0]  
      })

    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", -150)
    .attr("y",-40)
    .attr("font-size", "18")
    .attr("dy", ".35em")
    .attr("transform", "rotate(-90)")
    .text("SEATS");

    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x",width-130)
      .attr("y",height+40)
      .attr("font-size", "18")
      .attr("dy", ".35em")
      .text("POLLSTERS");


  // Draw legend
    var legend = svg.selectAll(".legend")
      .data(colors)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(30," + i * 20 + ")"; });
      
    legend.append("rect")
      .attr("x", width + 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d, i) {return colors[i];});


    legend.append("text")
      .attr("x", width + 40)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d, i) { 
        switch (i) {
          case 0: return party[0];
          case 1: return party[1];
          case 2: return party[2];
        }
      });
      
      
      // // Prep the tooltip bits, initial display is hidden
      // var tooltip = svg.append("g")
      //   .attr("class", "tooltip")
      //   .style("display", "none");
          
      // tooltip.append("rect")
      //   .attr("width", 30)
      //   .attr("height", 20)
      //   .attr("fill", "white")
      //   .style("opacity", 0.5);
      
      // tooltip.append("text")
      //   .attr("x", 15)
      //   .attr("dy", "1.2em")
      //   .style("text-anchor", "middle")
      //   .attr("font-size", "12px")
      //   .attr("font-weight", "bold");

  })

  .fail(function (error) {
    console.log(error);
  })  

});