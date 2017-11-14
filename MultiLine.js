// Data Visualization Project 2
// Quyen Ha and Marty Dang
// This is the line graph that plots the closing price of each stock over 6 months

//////////////////////////////////////////////////////////////////////////////////
// global variables
//   "constant gobal variables put on top, useful for updating
//   set the margin of the SVG
var Margin = {top: 20, right: 80, bottom: 60, left: 50};
var Width = 860 - Margin.left - Margin.right;
var Height = 500 - Margin.top - Margin.bottom;
//////////////////////////////////////////////////////////////////////////////////
// functions start here

function initialize (data) { 

    // make the time parser in the format month/day/year
    var timeParser = d3.timeParse("%m/%d/%Y");

    // format the data
    data.forEach(function(d) {

	// parsing time to format month/date/year
	d.date = timeParser(d.date);

	// convert prices with $ sign to floats using regex
	d.close = +parseFloat(d.close.replace(/[^\d\.]/, ''));
	d.open = +parseFloat(d.open.replace(/[^\d\.]/, ''));
	d.low = +parseFloat(d.low.replace(/[^\d\.]/, ''));
	d.high = +parseFloat(d.high.replace(/[^\d\.]/, ''));
	d.stock = d.stock;

    });

    // nesting the stocks by name
    var stocksByName = d3.nest()
	    .key(function(d) { return d.stock; })
	    .entries(data);

    console.log(stocksByName);

    // make the x and y scales
    var xScale = makexScale(data);
    var yScale = makeyScale(stocksByName);

    // make the colorScale
    var colorScale = makeColorScale(stocksByName);

    // make the svg
    var svgLine = makeLineSVG();
    
    // draw the lines
    drawLines(svgLine, stocksByName, data, 
	      xScale, yScale, colorScale);

    // draw the x and y axes
    var xAxis = makexAxis(svgLine, xScale);
    var yAxis = makeyAxis(svgLine, yScale);

    // add the menu option
    makeMenu(svgLine, stocksByName, data, xScale, yScale, colorScale, yAxis);

    // function to return to original multiseries graph
    returnHome(svgLine, stocksByName, data, 
	       xScale, yScale, yAxis, colorScale);

   // create the title on top of the SVG
    makeTitle();

} // end initialize

// put a title at the top. this is a distinct SVG element
function makeTitle () {

    // title is a separate SVG element
    // add svg to div with id multilines
    var headingsvg = d3.select("#multilines")
        .append("svg")
        .attr("width", Width)
        .attr("height", 30);    // height for the heading is 30 pixels
    
    // add text title to the svg element
    headingsvg.append("g")
	.append("text")
	.attr("class", "heading")
	.attr("text-anchor", "middle")
	.attr("x", Width / 1.8)
	.attr("y", 20)
	.attr("font-family", "sans-serif")
	.attr("font-size", "16px")
	.attr("font-weight", "bold")
	.text("Closing Price(s) of Stock(s) in the Dow Jones Index Over Time");
    
    // repositioning the buttons for aesthetic reasons
    var controls = document.getElementById("controls");
    controls.style.position = "absolute";
    controls.style.left = Width*1.15 + "px";
    controls.style.top = 0 + "px";

} // end makeTitle
 
// make svg context
function makeLineSVG () { 
    
    // add svg element
    var svgLine = d3.select("body")
	    .append("svg")
            .style("width", Width + Margin.left + Margin.right + "px")
            .style("height", Height + Margin.top + Margin.bottom + "px")
            .attr("width", Width + Margin.left + Margin.right)
            .attr("height", Height + Margin.top + Margin.bottom)
            .append("g")
            .attr("transform","translate(" + Margin.left + "," + Margin.top + ")");

    return svgLine;

} // end makeLineSVG

// make the xScale
function makexScale (data) {

    // make the time scale 
    var xScale = d3.scaleTime()
	    .domain(d3.extent(data, function(d) { return d.date; }))
	    .range([0, Width]);

    return xScale;

} // end makexScale

// make the yScale
function makeyScale (stocksByName) {

    //make the closing price scale
    var yScale = d3.scaleLinear()
	    .domain([ 
		d3.min(stocksByName, function(c) { 
		    return d3.min(c.values, function (d) { return d.close; }); 
		}),
		d3.max(stocksByName, function(c) { 
		    return d3.max(c.values, function (d) { return d.close; }); 
		})
	    ])
	    .range([Height, 0]);

    return yScale;

} // end makeyScale

// make the colorScale
function makeColorScale (stocksByName) {

    // make the color scale
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20b)
	    .domain(stocksByName.map(function(c) { return c.id; }));

    return colorScale;

} // end the colorScale

// draw the lines 
function drawLines (svgLine, stocksByName, data, xScale, yScale, colorScale) {

    // create variable originalLines to hold the lines 
    var originalLines = svgLine.selectAll(".originalLines")
	    .data(stocksByName)
	    .enter()
	    .append("g")
	    .attr("class", "originalLines");

    // define the line generator
    var closeLine = d3.line()
	    .x(function(d) { return xScale(d.date); })
	    .y(function(d) { return yScale(+d.close); });

    // draw the lines
    originalLines.append("path")
	.attr("class", "line")
	.attr("d", function(d) {
	    return closeLine(d.values);
	})
	.style("stroke", function(d) { return colorScale(d.key); })
	.on("mouseover", function(d) { 
	    d3.select(this).style("stroke-width", "5px");
	})
	.on("mouseout", function(d, i) {
	    d3.select(this).style("stroke-width", "1.5px");
	});

} // end drawLines

// draw the x Axis
function makexAxis (svgLine, xScale) {

    // reformat the time to month day year
    var formatTime = d3.timeFormat("%b %e %y");

    // make the axis generator
    var xAxis = d3.axisBottom(xScale)
	    .ticks(30)
	    .tickFormat(d3.timeFormat("%e-%b-%y"));

    // add xAxis to svgLine
    svgLine.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0, " + Height + ")")
	.call(xAxis);

    // modify texts on the ticks of xAxis
    svgLine.select(".x.axis")
	.selectAll("text")
	.style("text-anchor", "end")
	.attr("dx", "-.8em")
        .attr("dy", ".15em")
	.attr("transform", "rotate(-65)");

    return xAxis;

}// end makexAxis

// draw the y Axis
function makeyAxis (svgLine, yScale) { 

    // make the axis generator
    var yAxis = d3.axisLeft(yScale)
	    .ticks(14);

    // add yAxis to svgLine
    svgLine.append("g")
	.attr("class", "y axis")
	.call(yAxis);

    // add label to yAxis
    svgLine.append("text")
	.attr("class", "y label")
	.attr("transform", "rotate(-90)")
	.attr("x", -40)
	.attr("y", 6)
	.attr("dy", "0.71em")
	.attr("fill", "#000")
	.style("font", "11px sans-serif")
	.text("Close, $");

    return yAxis;

} // end makeyAxis

// add the menu option
function makeMenu (svgLine, stocksByName, data, xScale, yScale, colorScale, yAxis) {

    // select the menu from the HTML
    var stockMenu = d3.select("#stockDropDown");

    // create the drop down menu with options for stock names
    stockMenu.selectAll("optgroup")
	.data(stocksByName)
	.enter()
	.append("option")
	.attr("value", function (d) {
	    return d.key;
	})
	.text(function (d) {
	    return d.key;
	});

    // run update function when drop down selection changes
    d3.select("#stock").on("change", function () { 

	// find which stock was selected from the drop down menu
	var selectedStock = d3.select(this)
		.property("value");

	// remove multiseries lines after a stock is selected from menu
	d3.selectAll(".originalLines")
	    .remove();

	// remove last selected lines if a different stock is selected from menu
	d3.selectAll(".newLines")
	    .remove();

	// remove the mouseover effect of the previously selected line
	d3.selectAll(".mouse-over-effects")
	    .remove();

	// run the update function
	updateGraph(selectedStock, stocksByName, svgLine, 
		    xScale, yScale, colorScale, yAxis);

    });
} // end makeMenu

// update original multiseries line graph to two-line graph 
function updateGraph(selectedStock, stocksByName, svgLine, 
		     xScale, yScale, colorScale, yAxis) {

    // filter the data to include only the stock of interest
    var filteredStock = stocksByName.filter(
	function(d) {
	    return d.key === selectedStock;
	});

    // recaliberating the yScale with the new low and high prices
    yScale.domain([ 
	d3.min(filteredStock, function(c) { 
	    return d3.min(c.values, function (d) { return d.close; }); 
	}),
	d3.max(filteredStock, function(c) { 
	    return d3.max(c.values, function (d) { return d.close; }); 
	})
    ]);

    // draw the closing price line with recaliberated yScale
    updateLines(filteredStock, svgLine, xScale, yScale, colorScale);

    // update the yAxis
    svgLine.select(".y.axis")
	.transition()
	.duration(800)
	.call(yAxis);

    // create the hovering effect that traces the closing price
    hoverEffect (filteredStock, svgLine, xScale, yScale, colorScale);

} // end updateGraph

// redraw the closing price line of individual stock after rescaling y
function updateLines (filteredStock, svgLine, xScale, yScale, colorScale) {

    // create variable newLines to hold the new lines and points
    var newLines = svgLine.selectAll(".newLines")
	    .data(filteredStock)
	    .enter()
	    .append("g")
	    .attr("class", "newLines");

    // define the line generator for low stock price
    var newLine = d3.line()
	    .x(function(d) { return xScale(d.date); })
	    .y(function(d) { return yScale(+d.close); });

    // draw the line for low stock price
    newLines.append("path")
	.attr("class", "line")
	.attr("d", function(d) { return newLine(d.values); })
	.style("stroke", function(d) { return colorScale(d.key); });

    // create variable newPoints to hold the circles that represent data points
    var newPoints = newLines.append("g")
	    .attr("class", "newPoints");

    // draw the circles
    newPoints.selectAll("circle")
	.data(function(d) { return d.values; })
	.enter()
	.append("circle")
	.attr("cx", function(d) { return xScale(d.date); })
	.attr("cy", function(d) { return yScale(d.close); })
	.attr("r", 3)
	.style("opacity", 1)
	.style("fill", "red");

} // end updateLines

// create mouseover effects for high and low values of stocks
function hoverEffect (filteredStock, svgLine, xScale, yScale, colorScale)  {

    // read all element of class "line" into variable lines
    var lines = document.getElementsByClassName('line');

    // create the variable that will hold the entire mouseover effect
    var mouseG = svgLine.append("g")
	    .attr("class", "mouse-over-effects");

    // create the black vertical line to follow mouse
    mouseG.append("path")
	.attr("class", "mouse-line")
	.style("stroke", "black")
	.style("stroke-width", "1px")
	.style("opacity", "0");

    // create the variable that will hold the circle and text 
    var mousePerLine = mouseG.selectAll(".mouse-per-line")
	    .data(filteredStock)
	    .enter()
	    .append("g")
	    .attr("class", "mouse-per-line");

    // draw the circle that follows the lines
    mousePerLine.append("circle")
	.attr("r", 4.5);

    // add the text next to the circle that tells the circle's y_coordinate 
    // which is already scaled 
    mousePerLine.append("text")
	.attr("transform", "translate(10, 3)");

    // append a rect to catch mouse movements on canvas
    // since cannot catch mouse events on paths
    mouseG.append("rect")
	.attr("width", Width)
	.attr("height", Height)
	.attr("fill", "none")
	.attr("pointer-events", "all")
    
        // when mouse is not in the rect, all effects are turned off
	.on("mouseout", function () { 
	    // make line invisible
	    d3.select(".mouse-line")
		.style("opacity", "0");
	    // make circle invisible
            d3.selectAll(".mouse-per-line circle")
		.style("opacity", "0");
	    // make text invisible
            d3.selectAll(".mouse-per-line text")
		.style("opacity", "0");
	})

        // when mouse is in the rect, the effects are turned on
	.on("mouseover", function () {
	    // make line appear
	    d3.select(".mouse-line")
		.style("opacity", "1");
	    // make circle appear
            d3.selectAll(".mouse-per-line circle")
		.style("opacity", "1");
	    // make text appear
            d3.selectAll(".mouse-per-line text")
		.style("opacity", "1");
	})

        // when mousemove, creates the mouseover effect that records movement on path
	.on("mousemove", function () { 
	    
	    // pass on the mouse's position to variable mouse
	    var mouse = d3.mouse(this);

	    // function creates the mouseover effect
	    followMouse (filteredStock, mouse, lines, xScale, yScale); 
	});

} // end hoverEffect

function followMouse (filteredStock, mouse, lines, xScale, yScale) {

    // draw the black line that follows the mouse using mouse's position
    d3.select(".mouse-line")
	.attr("d", function () { 
	    var d = "M" + mouse[0] + "," + Height;
	    d += " " + mouse[0] + "," + 0;
	    return d;
	}); 

	d3.selectAll(".mouse-per-line")
	    .attr("transform", function(d) {  

		// set beginning to 0 and end to the length of the line
		var beginning = 0;
		var end = lines[0].getTotalLength();

		var target = null;

		// add a new date into the d.date array by scaling mouse's xposition
		var xDate = xScale.invert(mouse[0]);
		// find the index of the new date using d3.bisector
		var bisect = d3.bisector(function(d) { return d.date; }).right;
		// approximate new d.values using xDate
		var idx = bisect(d.values, xDate);
		
		// when mouse is still within svg
		while (true) {
		    target = Math.floor((beginning + end) / 2);
		    // compute a point from position on svg path
		    var pos = lines[0].getPointAtLength(target);
		    // if xposition of mouse is not the same as xposition of 
		    // point on svg path, or target equals end, or target
		    // equals beginning, break
		    if ((target === end || target === beginning) && 
			pos.x !== mouse[0]) {
			break;
		    }
		    // if xposition of mouse is smaller than xposition of point
		    // on svg path, set end to target
		    if (pos.x > mouse[0]) {
			end = target;
		    }
		    // if xposition of mouse larger than xposition of point on 
		    // svg path, set beginning to target
		    else if (pos.x < mouse[0]) {
			beginning = target; }
		    // else, position found
		    else {
			break; //position found
		    }
		}
		
		// add text next to circle
		// value is y-coordinate accounted for yScale
		d3.select(this).select('text')
		    .text(yScale.invert(pos.y).toFixed(2));
		
		// transform the position of mouse-per-line to follow mouse
		return "translate(" + mouse[0] + "," + pos.y +")"; 	
	    });
}

// return to original multiseries graph when Home button is selected 
function returnHome (svgLine, stocksByName, data, 
		     xScale, yScale, yAxis, colorScale) { 

    // when button "Home" is selected
    d3.select("#returnHome")
	.on("click", function() {

	    // remove all the old price line when home button is selected
	    d3.selectAll(".newLines")
		.remove();

	    // remove the hover effect when home button is selected
	    d3.selectAll(".mouse-over-effects")
		.remove();

	    // recaliberating the yScale
	    yScale.domain([ 
		d3.min(stocksByName, function(c) { 
		    return d3.min(c.values, function (d) { return d.close; }); 
		}),
		d3.max(stocksByName, function(c) { 
		    return d3.max(c.values, function (d) { return d.close; }); 
		})
	    ]);

	    // redrawing the lines
	    drawLines (svgLine, stocksByName, data, xScale, yScale, colorScale);

	    // update the yAxis
	    svgLine.select(".y.axis")
		.transition()
		.duration(800)
		.call(yAxis);
	});

} // end returnHome

//////////////////////////////////////////////////////////////////////
// read the data file and set up the visualization 
d3.csv("DJI.csv", function(error, data) {
    // if error log to console
    if (error) { 
	console.log(error);
    } else {
	console.log(data);
	initialize(data);
    }
});
