
$('body').tooltip({selector: '[title],[data-title],[data-original-title]', container: 'body', html: true, animated: 'fade'});

const margin = {top: 20, right: 160, bottom: 35, left: 30};

const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// d3.csv('static/data/data.csv', function(data){console.log(data);});

$('.dropdown-menu').on('click', '.dropdown-item', function() {
  const selected_year = $(this).text();
  $.ajax({
    type: 'GET',
    url: '/data',
  })
      .done(function(data) {
        res_data = data.response;

        const year_dataset = _.filter(res_data, function(res) {
          return res.YEAR == selected_year;
        });


        const table_data = _.map(year_dataset, function(d) {
          return [d.POLLSTERS, d.NDA, d.UPA, d.OTHERS];
        });


        $('#heading').html('<h5>Official Results - '+selected_year+'</h5>');
        $('#source').html('<span>Source: </span><a target="_blank" href="https://www.cnbctv18.com/politics/how-exit-polls-have-fared-in-past-lok-sabha-elections-3389801.htm">CNBC TV18</a>');
        $('#seat_table').DataTable().destroy();
        $('#seat_table').show();

        $('#seat_table').DataTable({
          data: table_data,
          // bPaginate: false,
          // bInfo: false,
          bSort: false,
          pageLength: 4,
          lengthChange: false,
          columns: [
            {title: 'POLLSTERS'},
            {title: 'NDA'},
            {title: 'UPA'},
            {title: 'OTHERS'},
          ],
          order: false,
        });

        $('#download').removeClass('disabled');

        const pollsters = _.map(year_dataset, 'POLLSTERS');

        const party = ['NDA', 'UPA', 'OTHERS'];
        const colors = ['#ff7f00', '#4daf4a', '#377eb8'];

        /* Data in strings like it would be if imported from a csv */

        const stack = d3.stack().keys(party);

        const dataset = stack(year_dataset);

        $('#canvas1').empty();
        const svg = d3.selectAll('#canvas1')
            .append('svg').attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', '0 0 600 500').classed('svg-content', true)
            .append('g')
            .attr('transform', 'translate(' + 2*margin.left + ',' + 2*margin.top + ')');

        // Set x, y and colors
        const x = d3.scaleBand()
            .domain(pollsters.map(function(d) {
              return d;
            }))
            .range([10, width-10], 0.02);

        const y = d3.scaleLinear()
            .domain([0, 600]).range([height, 0]);

        // Define and draw axes
        const yAxis = d3.axisLeft(y)
            .ticks(5)
            .tickSize(-width, 0, 0)
            .tickFormat( function(d) {
              return d;
            } );

        const xAxis = d3.axisBottom(x);

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);


        // Create groups for each series, rects for each segment
        const groups = svg.selectAll('g.cost')
            .data(dataset)
            .enter().append('g')
            .attr('class', 'cost')
            .style('fill', function(d, i) {
              return colors[i];
            });

        // console.log(_.each(dataset, function(d){ return d } ))

        groups.selectAll('rect')
            .data(function(d) {
              return d;
            })
            .enter()
            .append('rect')
            .attr('x', function(d) {
              return x(d.data.POLLSTERS);
            })
            .attr('y', function(d) {
              return y(d[1]);
            })
            .attr('height', function(d) {
              return y(d[0]) - y(d[1]);
            })
            .attr('width', x.bandwidth()-20)
            .attr('data-placement', 'right')
            .attr('data-toggle', 'popover')
            .attr('data-title', function(d) {
              return d[1]-d[0];
            });

        svg.append('text')
            .attr('class', 'y label')
            .attr('text-anchor', 'end')
            .attr('x', -150)
            .attr('y', -40)
            .attr('font-size', '18')
            .attr('dy', '.35em')
            .attr('transform', 'rotate(-90)')
            .text('SEATS');

        svg.append('text')
            .attr('class', 'x label')
            .attr('text-anchor', 'end')
            .attr('x', width-180)
            .attr('y', height+40)
            .attr('font-size', '18')
            .attr('dy', '.35em')
            .text('POLLSTERS');


        // Draw legend
        const legend = svg.selectAll('.legend')
            .data(colors)
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
              return 'translate(10,' + i * 20 + ')';
            });

        legend.append('rect')
            .attr('x', width + 10)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', function(d, i) {
              return colors[i];
            });


        legend.append('text')
            .attr('x', width + 32)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'start')
            .text(function(d, i) {
              switch (i) {
                case 0: return party[0];
                case 1: return party[1];
                case 2: return party[2];
              }
            });

        $('#canvas3').empty();
        const svg1 = d3.selectAll('#canvas3').append('svg')
            .attr('width', 300).attr('height', 180);
        // .attr("preserveAspectRatio", "xMinYMin meet")
        // .attr("viewBox", "0 0 360 180").classed("svg-content", true);

        const width1 = svg1.attr('width');
        const height1 = svg1.attr('height');
        const g = svg1.append('g').attr('transform', 'translate(' + width1 / 2 + ',' + height1 / 2 + ')');


        const color = d3.scaleOrdinal(colors);


        const official_seat = _.filter(year_dataset, function(res) {
          return res.POLLSTERS == 'Official';
        });

        const final_seat = _.pick(official_seat[0], party);

        var data = _.map(final_seat, function(value, key) {
          return {Party: key, Seat: value};
        });

        const pie = d3.pie().value(function(d) {
          return d.Seat;
        });
        const radius = Math.min(width1, height1) / 2;

        const arc = d3.arc().innerRadius(50).outerRadius(radius);

        // var label = d3.arc().innerRadius(radisu-80).outerRadius(radius);

        const arcs = g.selectAll('arc').data(pie(data)).enter().append('g').attr('class', 'arc');

        arcs.append('path').attr('d', arc).attr('fill', function(d) {
          return color(d.data.Party);
        })
            .attr('data-placement', 'right')
            .attr('data-toggle', 'popover')
            .attr('data-title', function(d) {
              return d.data.Seat;
            });

        // arcs.append("text").attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
        // .text(function(d) { return d.data.party ; });


        const legend1 = svg1.selectAll('.legend')
            .data(colors)
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
              return 'translate(130,' + i * 20 + ')';
            });

        legend1.append('rect')
            .attr('x', 120)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', function(d, i) {
              return colors[i];
            });


        legend1.append('text')
            .attr('x', 140)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'start')
            .style('font-size', 12)
            .text(function(d, i) {
              switch (i) {
                case 0: return data[0].Seat;
                case 1: return data[1].Seat;
                case 2: return data[2].Seat;
              }
            });
      })

      .fail(function(error) {
        console.log(error);
      });
});
