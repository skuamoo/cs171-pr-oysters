PrioVis = function(_parentElement, _data, _metaData){ 
    this.parentElement = _parentElement; 
    this.data = _data; 
    this.metaData = _metaData; 
    this.displayData = []; 
 
    this.totaltime = d3.max(this.data, function(d) {return d.time;}) - d3.min(this.data, function(d) {return d.time;}); 
 
    // TODO: define all constants here 
    this.margin = {top: 20, right: 20, bottom: 160, left: 90}; 
    this.width = 650 - this.margin.left - this.margin.right; 
    this.height = 440 - this.margin.top - this.margin.bottom; 
 
    this.initVis(); 
 
} 
 
 
/** 
 * Method that sets up the SVG and the variables 
 */ 
PrioVis.prototype.initVis = function(){ 
 
    var that = this; // read about the this 
 
 
    //TODO: construct or select SVG 
    //TODO: create axis and scales 
//    this.xScale = d3.scale.ordinal().domain(d3.range(that.displayData.length)).rangeRoundBands([0, that.width], 0.05) 
    this.xScale = d3.scale.ordinal().rangeRoundBands([0, that.width], .05); 
    this.yScale = d3.scale.linear().range([that.height, 0]); 
 
    this.svg = this.parentElement.append("svg") 
            .attr("width", this.width + this.margin.left + this.margin.right) 
            .attr("height", this.height + this.margin.top + this.margin.bottom) 
        .append("g") 
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")"); 
 
    this.xAxis = d3.svg.axis() 
        .scale(this.xScale) 
        .orient("bottom"); 
 
    this.yAxis = d3.svg.axis() 
        .scale(this.yScale) 
        .orient("left"); 
 
    this.svg.append("g") 
        .attr("class", "x axis") 
          .attr("transform", "translate(0," + this.height + ")"); 
 
    this.svg.append("g") 
        .attr("class", "y axis");

    this.line = d3.svg.line() 
    .x(function(d, i) { return that.xScale(i); }) 
    .y(function(d) { return that.yScale(d); })
    .interpolate("linear");

    this.barsvg = this.svg.append("g");

    this.path = this.svg.append("path");

    this.path2 = this.svg.append("path"); 

    var legend = this.svg.append("g")
      .attr("class", "legend")
      .attr("x", 470)
      .attr("y", 5)
      .attr("height", 100)
      .attr("width", 100);

    legend.append("rect")
      .attr("x", 470)
      .attr("y", 5)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", "blue");

    legend.append("text")
      .attr("x", 485)
      .attr("y", 15)
      .attr("font-size", "10px")
      .text("Actual Values");

    legend.append("rect")
      .attr("x", 470)
      .attr("y", 25)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", "black");

    legend.append("text")
      .attr("x", 485)
      .attr("y", 35)
      .attr("font-size", "10px")
      .text("Overall Average");
     
    // filter, aggregate, modify data 
    this.wrangleData(null); 
 
    // call the update method 
    this.updateVis(); 
} 
 
 
/** 
 * Method to wrangle the data. In this case it takes an options object 
 * @param _filterFunction - a function that filters data or "null" if none 
 */ 
PrioVis.prototype.wrangleData= function(_filterFunction){ 
 
    // displayData should hold the data which is visualized 
    this.results = this.filterAndAggregate(_filterFunction);
    this.displayData = this.results.filtered;
    this.allData = this.results.averages;
    //// you might be able to pass some options, 
    //// if you don't pass options -- set the default options 
    //// the default is: var options = {filter: function(){return true;} } 
    //var options = _options || {filter: function(){return true;}}; 
 
} 
 
 
 
/** 
 * the drawing function - should use the D3 selection, enter, exit 
 */ 
PrioVis.prototype.updateVis = function(){ 
    var that = this; 

    // Dear JS hipster, 
    // you might be able to pass some options as parameter _option 
    // But it's not needed to solve the task. 
    // var options = _options || {}; 
 
    // TODO: implement... 
    // TODO: ...update scales 
    // TODO: ...update graphs
    var scalemax = 0;
    if (d3.max(this.displayData) > d3.max(this.allData)) {
        scalemax = d3.max(this.displayData);
    } else {
        scalemax = d3.max(this.allData);
    }
 
    this.xScale.domain(d3.range(that.displayData.length)); 
    this.yScale.domain([0, scalemax]);//d3.max(this.displayData)]); 
 
    this.xAxis.tickFormat(function(d, i) { return that.metaData.priorities[i]["item-title"];}); 
 
    this.svg.select(".x.axis") 
        .call(this.xAxis) 
        .selectAll("text") 
              .style("text-anchor", "end") 
              .attr("dx", "-.9em") 
              .attr("dy", ".15em") 
              .attr("transform", function(d) { return "rotate(-45)"}); 
 
    this.svg.select(".y.axis") 
        .call(this.yAxis);

    this.path 
        .datum(this.allData) 
        .attr("class", "line") 
        .attr("d", this.line)
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("stroke-width", 5)
        .attr("transform", "translate(" + this.xScale.rangeBand()/2 + ",0)");

    this.path2
        .datum(this.displayData) 
        .attr("class", "line") 
        .attr("d", this.line)
        .attr("stroke", "blue")
        .attr("fill", "none")
        .attr("stroke-width", 4)
        .attr("transform", "translate(" + this.xScale.rangeBand()/2 + ",0)");

    var bar = this.barsvg.selectAll(".bar")//this.svg.selectAll(".bar")
        .data(this.displayData, function(d) { return d; });

    var bar_enter = bar.enter().append("g");

    bar_enter.append("rect");

    bar
        .attr("class", "bar")
      .style("fill", function(d, i) { return that.metaData.priorities[i]["item-color"];})
        .attr("transform", function(d, i) {return "translate(" + that.xScale(i) + " , " + that.yScale(d) + ")"; });

    bar.exit()
        .remove();

    bar.selectAll("rect") 
      .attr("x", 0) 
      .attr("y", 0) 
      .attr("height", function(d) { return that.height - that.yScale(d);})
      .attr("width", this.xScale.rangeBand());  
  
} 
 
 
/** 
 * Gets called by event handler and should create new aggregated data 
 * aggregation is done by the function "aggregate(filter)". Filter has to 
 * be defined here. 
 * @param selection 
 */ 
PrioVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){ 
    // TODO: call wrangle function 
    this.brushEmpty = false;
    if(selectionStart - selectionEnd == 0) {
            this.brushEmpty = true;
    }
    this.wrangleData(function(d) {return d.time >= selectionStart && d.time <= selectionEnd;});
    this.timediff = selectionEnd - selectionStart; 
    this.updateVis();   
} 
 
 
/* 
* 
* ================================== 
* From here on only HELPER functions 
* ================================== 
* 
* */ 
 
 
 
/** 
 * The aggregate function that creates the counts for each age for a given filter. 
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range 
 * @returns {Array|*} 
 */ 
PrioVis.prototype.filterAndAggregate = function(_filter){ 
 
 
    // Set filter to a function that accepts all items 
    // ONLY if the parameter _filter is NOT null use this parameter
    var tdiff = this.totaltime; 
    var filter = function(){return true;} 
    if (_filter != null && this.brushEmpty == false){ 
        filter = _filter;
        tdiff = this.timediff; 
    } 
    //Dear JS hipster, a more hip variant of this construct would be: 
    // var filter = _filter || function(){return true;} 
 
    var that = this; 
    // create an array of values for prios 0-15 
    var res = d3.range(16).map(function () { 
        return 0; 
    });
    //create array of values for prios averages
    var res_all = d3.range(16).map(function () { 
        return 0; 
    });

//calculate average values for selected time length
    var timeratio = tdiff/this.totaltime; 
 
    this.data 
        .forEach(function(d, i) { 
            for(var j=0; j< d.prios.length; j++){ 
                res_all[j] += timeratio*(d.prios[j]); 
            } 
        });
//convert averages to int
    for (var k=0; k<res_all.length; k++) {
        var l = res_all[k];
        res_all[k] = parseInt(l);
    }
 
//calculate values for filtered data 
    this.data 
        .filter(filter) 
        .forEach(function(d, i) { 
            for(var j=0; j< d.prios.length; j++){ 
                res[j] += d.prios[j]; 
            } 
 
        });    
    // accumulate all values that fulfill the filter criterion 
 
    // TODO: implement the function that filters the data and sums the values 
    return {filtered: res, averages: res_all}; 
 
}