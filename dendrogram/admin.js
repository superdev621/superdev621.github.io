jQuery(document).ready(function() {
	var initObj		= new initAdmin();
	
	initObj.init();
});
var initAdmin		= function() {
	var main 		= this;
	var level1 		= [];
	var level2 		= [];
	var level3		= [];
	var resultData 	= [];
	var result_level = [];
	var index;
	var drawData = [];
	var textArray = [];
	var superior;
	var corr_temp = [];
	var sort_corr_temp = [];
	var max_arr = [];
	var level = [];
	main.init		= function() {
		main.initEvent();
	};

	main.initEvent 	= function() {
		main.readIndex();
		main.readResultData();
	};

	main.readIndex 	= function() {
		d3.csv('temp.csv', function(error, data) {
			data.forEach(function(d) {
				if (d['level 1'] != '')
					level1.push(d['level 1']);
				if (d['level 2'] != '')
					level2.push(d['level 2']);
				if (d['level 3'] != '')
					level3.push(d['level 3']);
			})
			level.push(level1);
			level.push(level2);
			level.push(level3);
		});

		d3.csv('temp2.csv', function(error, data) {
			textArray = data;
		})
	}

	main.readResultData = function() {
		d3.csv('Results.csv', function(error, data) {
			main.getCorrelation(data);
			main.refactorData(data);
			main.createChartData();
		})
	}

	main.getCorrelation = function(data) {
		var d = data[0];
		var arrayRange = level3[level3.length-1];
		for ( i = 0 ; i < arrayRange ; i ++ ) {
			var tem_arr = [];
			var sort_temp_arr = [];
			for ( j = 0 ; j < arrayRange ; j ++ ) {
				tem_arr.push(0);
				sort_temp_arr.push(0);
			}
			corr_temp.push(tem_arr);
			sort_corr_temp.push(sort_temp_arr);
		}
		for ( i = 0 ; i < arrayRange ; i ++ ) {
			for ( j = 0 ; j < arrayRange ; j ++ ) {
				if ( i == j) {
					corr_temp[i][j] = 0;
					sort_corr_temp[i][j] = 0;
				}
				else {
					sort_corr_temp[i][j] = 0;
					corr_temp[i][j] = 0;
					var i_avg = 0;
					var j_avg = 0;
					for ( k = 0 ; k < 3 ; k ++ ) {
						var iIndex = "P Tot" + (i + 1) + " " + (k + 1);
						var jIndex = "P Tot" + (j + 1) + " " + (k + 1);
						i_avg += parseFloat(d[iIndex].replace(/\,/g,""));
						j_avg += parseFloat(d[jIndex].replace(/\,/g,""));
					}
					i_avg /= 3;
					j_avg /= 3;
					var i_sd = 0, j_sd = 0;
					for ( k = 0 ; k < 3 ; k ++ ) {
						var iIndex = "P Tot" + (i + 1) + " " + (k + 1);
						var jIndex = "P Tot" + (j + 1) + " " + (k + 1);
						i_sd += Math.pow((parseFloat(d[iIndex].replace(/\,/g,"")) - i_avg), 2);
						j_sd += Math.pow((parseFloat(d[jIndex].replace(/\,/g,"")) - j_avg), 2);
						corr_temp[i][j] += (parseFloat(d[iIndex].replace(/\,/g,"")) - i_avg) * (parseFloat(d[jIndex].replace(/\,/g,"")) - j_avg);
					}
					corr_temp[i][j] = corr_temp[i][j] / Math.sqrt(i_sd * j_sd);
					sort_corr_temp[i][j] = Math.abs(corr_temp[i][j]);
				}
			}
		}
		for (i = 0 ; i < arrayRange; i ++ ) {
			sort_corr_temp[i].sort(sortNum);
			for (j = arrayRange -1 ; j > arrayRange - 20 ; j --)
				max_arr.push(sort_corr_temp[i][j]);
		}
		max_arr.sort(sortNum);
	}

	function sortNum(a, b) {
		return a - b;
	}

	main.refactorData = function(data) {
		var d = data[0];
		var temp1 = [];
		var valueArray = [];
		for ( var i = 0 ; i < level1.length ; i ++ ) {
			var temp_sum = 0;
			for ( var j = 0 ; j < 3 ; j ++ ) {
				index = "P Tot" + level1[i] + " " + (j + 1);
				temp_sum += parseFloat(d[index].replace(/\,/g,""));
			}
			valueArray.push(temp_sum);
			temp1.push({'value': temp_sum, 'name': textArray[level1[i] - 1].text});
		}
		result_level.push(temp1);

		var temp2 = [];
		for ( var i = 0 ; i < level2.length ; i ++ ) {
			var temp_sum = 0;
			for ( var j = 0 ; j < 3 ; j ++ ) {
				index = "P Tot" + level2[i] + " " + (j + 1);
				temp_sum += parseFloat(d[index].replace(/\,/g,""));
			}
			valueArray.push(temp_sum);
			temp2.push({'value': temp_sum, 'name': textArray[level2[i] - 1].text});
		}
		result_level.push(temp2);

		var temp3 = [];
		for ( var i = 0 ; i < level3.length ; i ++ ) {
			var temp_sum = 0;
			for ( var j = 0 ; j < 3 ; j ++ ) {
				index = "P Tot" + level3[i] + " " + (j + 1);
				temp_sum += parseFloat(d[index].replace(/\,/g,""));
			}
			valueArray.push(temp_sum);
			temp3.push({'value': temp_sum, 'name': textArray[level3[i] - 1].text});
		}
		result_level.push(temp3);
		valueArray.sort(sortNum);
		superior = valueArray[parseInt(valueArray.length/10) * 9];
	}

	var id = 1;
	var depth = 0;
	console.log(level);
	var createChildren = function(d, i) {
		if ( result_level[i] != undefined ) {
			for ( var j = 0 ; j < result_level[i].length ; j ++ ) {
				var temp_element = {'id':id++, 'value': result_level[i][j], 'parent': d.id, 'index': parseInt(level[i][j])};
				drawData.push(temp_element);
				createChildren(temp_element, i + 1);
			}
		}
		return;
	}

	main.createChartData = function() {
		var element = {'id' : 0, 'parent' : null, 'value':{'value' : 0, 'name': 'root'}};
		drawData.push(element);
		createChildren(element, 0);
		main.drawChart(drawData);
	}

	main.drawChart = function(data) {
		var width = 1400,
    		height = 1950;
		// var svg = d3.select("svg"),
		    // width = +svg.attr("width"),
		    // height = +svg.attr("height"),
		var svg = d3.select("div").append("svg")
					.attr("width", width)
					.attr("height", height),
		    margin = {top: 10, right: 10, bottom: 30, left: 0},
		    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		var div = d3.select("body").append("div")	
				    .attr("class", "tooltip")				
				    .style("opacity", 0);

		var stratify = d3.stratify()
						.parentId(function(d) { return d.parent; });

    	var tree = d3.cluster()
    				.size([540, 480])
    				.separation(function(a, b) { return (a.parent == b.parent ? 1 : 3) / a.depth; });
    	var treemap = d3.tree().size([height, width]);
    	var duration = 750;
    	var root = tree(stratify(drawData)
      					.sort(function(a, b) { return (a.value - b.value); }));
    	
    	root.children.forEach(collapse);

    	update(root);

        // collapse the node and all it's children
        function collapse(d) {
        	if (d.children) {
        		d._children = d.children;
        		d._children.forEach(collapse);
		        d.children = null;
	        }
        }

        function update(source) {

	        	// assigns the x and y position for the nodes
	        var treeData = treemap(root);

	        // compute the new tree layout
	        var nodes = treeData.descendants(),
	            links = treeData.descendants().slice(1);

	        nodes.forEach(function(d) { d.y = d.depth * 400; });

	        var node = svg.selectAll('g.node')
		        .data(nodes, function(d) { return d.id || (d.id = ++i); });

		    var nodeEnter = node.enter().append('g')
		        .attr('class', 'node')
		        .attr('transform', function(d) {
		        	if (source.y0 != undefined) 
		        		return 'translate(' + (source.y0 + margin.top) + ',' + (source.x0 + margin.left) + ')';
		        })
		        .on('click', click)
		        .on('mouseover', function(d) {
		        	div.transition()
		        		.duration(200)
		        		.style('opacity', .9);
		        	div.html('name: ' + (d.data.value.name) + "<br>")
		        		.style("left", (d3.event.pageX) + "px")
		        		.style("top", (d3.event.pageY - 28) + "px");
		        })
		        .on('mouseout', function(d) {
		        	div.transition()
		        		.duration(500)
		        		.style('opacity', 0);
		        });

	        nodeEnter.append('circle')
		        .attr('class', 'node')
		        .attr('r', 1e-6)
		        // .attr('r', function(d) {
		        // 	return d.data.value * 10;
		        // })
		        .style('fill', function(d) {
		        	return d._children ? 'lightsteelblue' : '#fff';
		        });

	        nodeEnter.append('text')
		        .attr('dy', '.35em')
		        .attr('x', function(d) {
		        	return d.children || d._children ? 0 : 13;
		        })
		        .attr('y', function(d) {
		        	return d.children || d._children ? -20 : 0;
		        })
		        .attr('text-anchor', function(d) {
		        	return d.children || d._children ? 'middle' : 'start';
		        })
		        .text(function(d) {
		        	console.log(d);
		        	if ( d.parent == null ) 
		        		return 0;
		        	if ( d.parent.data.index == undefined) 
		        		return 0;
		        	else 
		        		return corr_temp[d.data.index + 1][d.parent.data.index + 1];
		        });

	        nodeEnter.append('text')
		        .attr('x', -3)
		        .attr('y', 3)
		        .attr('cursor', 'pointer')
		        .style('font-size', '10px')
		        .text(function(d) {
		        	if (d.children) return d.children.length;
		        	else if (d._children) return d._children.length;
		        });

	        var nodeUpdate = nodeEnter.merge(node);

	        nodeUpdate.transition().duration(duration)
		        .attr('transform', function(d) {
		        	return 'translate(' + (d.y + margin.top) + ',' + (d.x + margin.left) + ')';
		        });

	        nodeUpdate.select('circle.node')
		        // .attr('r', 9)
		        .attr('r', function(d) {
		        	// return d.data.value.value * 20 + 5;
		        	if ( d.parent == null ) 
		        		return 5;
		        	if ( d.parent.data.id == 0) 
		        		return 5;
		        	else 
		        		return Math.abs(corr_temp[d.data.index + 1][d.parent.data.index + 1]) * 20 + 5;

		        })
		        .style('fill', function(d) {
		        	if (d.parent != null && d.parent.data.id !=0 && Math.abs(corr_temp[d.data.index + 1][d.parent.data.index + 1]) > max_arr[1800] && d._children )
		        		return 'green';
		        	else if (d._children)
		        		return 'lightsteelblue';
		        	else
		        		return '#fff';
		        })
		        .style('stroke', function(d) {
		        	if (d.parent != null && d.parent.data.index!= undefined && Math.abs(corr_temp[d.data.index + 1][d.parent.data.index + 1]) > sort_corr_temp[d.parent.data.index + 1][90])
		        		return '#0f0';
		        })
		        .attr('cursor', 'pointer');

	        var nodeExit = node.exit()
		        .transition().duration(duration)
		        .attr('transform', function(d) {
		        	return 'translate(' + (source.y + margin.top) + ',' + (source.x + margin.left) + ')';
		        })
		        .remove();

	        nodeExit.select('circle')
		        .attr('r', 1e-6);

	        nodeExit.select('text')
		        .style('fill-opacity', 1e-6);

	        
	        var link = svg.selectAll('path.link')
		        .data(links, function(d) { return d.id });

	        var linkEnter = link.enter().insert('path', 'g')
		        .attr('class', 'link')
		        .attr('d', function(d) {
		        	if (source.x0 != undefined) {
			        	var o = {x: source.x0 + margin.left, y: source.y0 + margin.top};
			        	return diagonal(o, o);
			        }
		        });

	        var linkUpdate = linkEnter.merge(link);

	        linkUpdate.transition().duration(duration)
		        .attr('d', function(d) { return diagonal(d, d.parent); });

	        var linkExit = link.exit()
		        .transition().duration(duration)
		        .attr('d', function(d) {
		        	var o = {x: source.x, y: source.y};
		        	return diagonal(o, o);
		        })
		        .remove();

	        nodes.forEach(function(d) {
	        	d.x0 = d.x + margin.left;
	        	d.y0 = d.y + margin.top;
	        });

	        function diagonal(s, d) {
	        	path = 'M ' + (s.y + margin.top) + ' ' + (s.x + margin.left) +
				        'C ' + ((s.y + d.y + (margin.top * 2)) / 2) + ' ' + (s.x + margin.left) +
				        ', ' + ((s.y + d.y + (margin.top * 2)) / 2) + ' ' + (d.x + margin.left) +
				        ', ' + (d.y + margin.top) + ' ' + (d.x + margin.left);
	        	return path;
	        }

	        function click(d) {
	        	if (d.children) {
	        		d._children = d.children;
	        		d.children = null;
		        } else {
	        		d.children = d._children;
	        		d._children = null;
		        }
		        update(d);
	        }

        }
	}
}