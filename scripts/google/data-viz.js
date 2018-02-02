define(['d3'], function(d3){

	/*$.get('data/git_output_data/git_summary.txt', function(data) {
	    $(".git_summary").text(data)
	});*/
	d3.text('data/git_output_data/git_summary.csv', function(data) {
		var parsedCSV = d3.csvParseRows(data);
		//console.log(parsedCSV)
		var container = d3.select('.git_summary')
            .append('table')

            .selectAll('tr')
                .data(parsedCSV).enter()
                .append('tr')

            .selectAll('td')
                .data(function(d) { return d; }).enter()
                .append('td')
                .text(function(d) { return d; });
	});

	d3.text('data/git_output_data/git_authors_list.csv', function(data) {
		var parsedCSV = d3.csvParseRows(data);
		//console.log(parsedCSV)
		var container = d3.select('.git_authors_list')
            .append('table')

            .selectAll('tr')
                .data(parsedCSV).enter()
                .append('tr')

            .selectAll('td')
                .data(function(d) { return d; }).enter()
                .append('td')
                .text(function(d) { return d; });
	});

	var svg = d3.select('#git_authors_cumulativeLineAdded'),
	    margin = {top: 20, right: 60, bottom: 30, left: 28},
	    width = +$('#git_authors_cumulativeLineAdded').width() - margin.right + margin.left,
    	height = +svg.attr('height') - margin.top - margin.bottom,
    	g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


    var x = d3.scaleBand()
	    .rangeRound([0, width])
	    .padding(0.1)
	    .align(0.1);

	var y = d3.scaleLinear()
	    .rangeRound([height, 0]);

	var z = d3.scaleOrdinal()
	    .range(['#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c']);

	d3.csv('data/git_output_data/git_authors_cumulativeLineAdded.csv', type, function(error, data) {
		if (error) throw error;

		var keys = data.columns.slice(1);

		  data.sort(function(b, a) { return b.total - a.total; });
		  x.domain(data.map(function(d) { return d.day; }));
		  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
		  z.domain(keys);

		  g.append('g')
		    .selectAll('g')
		    .data(d3.stack().keys(keys)(data))
		    .enter().append('g')
		      .attr('fill', function(d) { return z(d.key); })
		    .selectAll('rect')
		    .data(function(d) { return d; })
		    .enter().append('rect')
		      .attr('x', function(d) { return x(d.data.day); })
		      .attr('y', function(d) { return y(d[1]); })
		      .attr('height', function(d) { return y(d[0]) - y(d[1]); })
		      .attr('width', x.bandwidth());

		  g.append('g')
		      .attr('class', 'axis axis-x')
		      .attr('transform', 'translate(0,' + height + ')')
		      .call(d3.axisBottom(x));

		  g.append('g')
		      .attr('class', 'axis')
		      .call(d3.axisLeft(y).ticks(null, 's'))
		    .append('text')
		      .attr('x', 2)
		      .attr('y', y(y.ticks().pop()) + 0.5)
		      .attr('dy', '0.32em')
		      .attr('fill', '#fff')
		      .attr('font-weight', 'bold')
		      .attr('text-anchor', 'start')
		      .text('Lines added');

		  var legend = g.append('g')
		      .attr('font-family', 'sans-serif')
		      .attr('font-size', 10)
		      .attr('fill', '#fff')
		      .attr('text-anchor', 'end')
		    .selectAll('g')
		    .data(keys.slice().reverse())
		    .enter().append('g')
		      .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

		  legend.append('rect')
		      .attr('x', width/2 - 19)
		      .attr('width', 19)
		      .attr('height', 19)
		      .attr('fill', z);

		  legend.append('text')
		      .attr('x', width/2 - 24)
		      .attr('y', 9.5)
		      .attr('dy', '0.32em')
		      .text(function(d) { return d; });
	});

	function type(d, i, columns) {
		for (var i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
		d.total = t;
		return d;
	}
});