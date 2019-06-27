
$('body')    
// Anything with a title= or data-title= attribute will be shown as a tooltip
.tooltip({selector: '[title],[data-title],[data-original-title]', container: 'body', html: true, animated: 'fade'})

var margin = {top: 20, right: 160, bottom: 35, left: 30};

var width  = 600 - margin.left - margin.right,
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

    
    var table_data = _.map(year_dataset, function(d){ return [d.POLLSTERS, d.NDA, d.UPA, d.OTHERS] });
    
    
    $("#heading").html('<h5>Official Results</h5>');
    $("#seat_table").DataTable().destroy();
    $("#seat_table").show();
    
    $("#seat_table").DataTable({
      data: table_data,
      // bPaginate: false,
      // bInfo: false,  
      pageLength: 4,
      lengthChange: false,
      columns: [
        {title: "POLLSTERS"},
        {title: "NDA"},
        {title: "UPA"},
        {title: "OTHERS"}
      ],
      order: false,
    });

    $('#download').removeClass('disabled');
     
    var pollsters = _.map(year_dataset, 'POLLSTERS');
    
    var party  =  ['NDA','UPA','OTHERS']
    var colors = ['#ff7f00','#4daf4a','#377eb8']

    /* Data in strings like it would be if imported from a csv */

    var stack = d3.stack().keys(party)

    var dataset = stack(year_dataset)

    $('#canvas1').empty();
    var svg = d3.selectAll("#canvas1")
    .append("svg").attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 600 500").classed("svg-content", true)
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

    // console.log(_.each(dataset, function(d){ return d } ))

    var rect = groups.selectAll("rect")
      .data(function(d) { return d; })
      .enter()
      .append("rect") 
      .attr("x", function(d) { return x(d.data.POLLSTERS) })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth()-20)
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
      .attr("x",width-180)
      .attr("y",height+40)
      .attr("font-size", "18")
      .attr("dy", ".35em")
      .text("POLLSTERS");


  // Draw legend
    var legend = svg.selectAll(".legend")
      .data(colors)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(10," + i * 20 + ")"; });
      
    legend.append("rect")
      .attr("x", width + 10)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d, i) {return colors[i];});


    legend.append("text")
      .attr("x", width + 32)
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

      $("#canvas3").empty();
      var svg1 = d3.selectAll("#canvas3").append("svg")
      .attr('width', 360).attr('height', 180);
      // .attr("preserveAspectRatio", "xMinYMin meet")
      // .attr("viewBox", "0 0 300 180").classed("svg-content", true);
      
      var width1 = svg1.attr('width');
      var height1 = svg1.attr('height');
      var g = svg1.append("g").attr("transform", "translate(" + width1 / 2 + "," + height1 / 2 + ")");
      
      
      var color = d3.scaleOrdinal(colors);

      
      var official_seat = _.filter(year_dataset,function(res){
        return res.POLLSTERS == 'Official'; 
      });

      var final_seat = _.pick(official_seat[0], party)

      var data = _.map(final_seat, function(value, key){
        return {Party: key, Seat: value};
      });
    
      var pie = d3.pie().value(function(d) { return d.Seat; });
      var radius = Math.min(width1, height1) / 2;
      
      var arc = d3.arc().innerRadius(50).outerRadius(radius);

      // var label = d3.arc().innerRadius(radisu-80).outerRadius(radius);
      
      var arcs = g.selectAll('arc').data(pie(data)).enter().append('g').attr('class', 'arc');

      arcs.append('path').attr('d', arc).attr('fill', function(d){ return color(d.data.Party) })
      .attr('data-placement', 'right')
      .attr('data-toggle', 'popover')
      .attr('data-title', function(d){
        return d.data.Seat 
      });

      // arcs.append("text").attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
      // .text(function(d) { return d.data.party ; });


    var legend1 = svg1.selectAll(".legend")
    .data(colors)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(130," + i * 20 + ")"; });
    
    legend1.append("rect")
      .attr("x", 130 + 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d, i) {return colors[i];});


    legend1.append("text")
      .attr("x", 130 + 40)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .style("font-size", 12)
      .text(function(d, i) { 
        switch (i) {
          case 0: return data[0].Seat+ " Seats";
          case 1: return data[1].Seat+ " Seats";
          case 2: return data[2].Seat+ " Seats";
        }
    });
      
      
      
  })

  .fail(function (error) {
    console.log(error);
  })  

});