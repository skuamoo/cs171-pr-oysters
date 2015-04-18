CountVis = function(_parentElement, _data, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
//    this.metaData = _metaData;
    this.eventHandler = _eventHandler;
    this.displayData = [];

    // TODO: define all "constants" here
    this.margin = {top:20, right:20, bottom:30, left:80};
    this.width = 600 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CountVis.prototype.initVis = function(){

    var that = this; // read about the this

    //TODO: implement here all things that don't change
//    this.xScale = d3.scale.ordinal().rangeRoundBands([0, that.width], .05);
    this.xScale = d3.scale.linear().range([0, this.width]);
    this.yScale = d3.scale.pow()
        .exponent(1)
        .range([this.height, 0]);
    //TODO: implement here all things that need an initial status
    // Examples are:
    // - construct SVG layout
    this.svg = this.parentElement.append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
/*
    this.point = this.svg.selectAll(".point")
        .data(this.data)
        .enter()
        .append("g").attr("class", "point");
//        .filter(function(d) { return d.species == "Oyster";});
*/

    // - create axis

//        .domain([0, d3.max(that.data, function(d) { return d.pounds; })]);
    
    this.xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left");   
    // -  implement brushing !!
//    this.brush = d3.svg.brush()
//        .x(this.xScale)
 //       .on("brush", function(){
 //           console.log(that.brush.extent());
 //           console.log(that.brush.empty());
 //           $(that.eventHandler).trigger("selectionChanged", that.brush.extent());
 //       });

//    this.line = d3.svg.line()
//        .x(function(d) {return that.xScale(d.year)})
//        .y(function(d) {return that.yScale(d.pounds)})
 //       .interpolate("linear");


//    this.sizescale = d3.scale.linear().range([2,20])
//        .domain([d3.min(this.data, function(d) {return d.value;}), d3.max(this.data, function(d) {return d.value;})]);
/*
    this.point.append("circle")
        .style("fill", function(d) { if (d.state == "Maryland") {return "blue";} else {return "red";}})
        .style("opacity", .8)
        .attr("cx", function(d){return that.xScale(d.year);})
        .attr("cy", function(d) {return that.yScale(d.pounds);})
        .attr("r", function(d) {return that.sizescale(d.value);})
        .append("svg:title")
            .text(function(d){ return "year " + d.year + " pounds " + d.pounds + " value " + d.value + " state " + d.state + " species " + d.species;});
 */ 



    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")");

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("id", "yaxis");
/*
    this.svg.append("g")
            .attr("class", "brush")
        .call(this.brush)
        .selectAll("rect")
            .attr("height", this.height);
*/
    // --- ONLY FOR BONUS ---  implement zooming

    //TODO: implement the slider -- see example at http://bl.ocks.org/mbostock/6452972
    //this.addSlider(this.svg)
//    this.addSlider();

    // filter, aggregate, modify data
    this.wrangleData(function(d) {return d.species == "Oyster";});
    // call the update method
    this.updateVis();
}



/**
 * Method to wrangle the data. In this case it takes an options object
  */
CountVis.prototype.wrangleData= function(_filterFunction){
    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    this.displayData = this.filterAndAggregate(_filterFunction);
}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
CountVis.prototype.updateVis = function(){
    var that = this;

    // TODO: implement update graphs (D3: update, enter, exit)
 //   this.xScale.domain(d3.range(that.displayData.length));//
    this.xScale.domain([d3.min(that.displayData, function(d) { return d.year; }), d3.max(that.displayData, function(d) { return d.year; })]);
    this.yScale.domain([0, d3.max(that.displayData, function(d) { return d.md_pounds; })]);

//    this.xAxis.tickFormat(function(d) { return d.year;});

    this.svg.select(".x.axis")
        .call(this.xAxis)
        .selectAll("text") 
              .style("text-anchor", "end") 
              .attr("dx", "-.9em") 
              .attr("dy", ".15em") 
              .attr("transform", function(d) { return "rotate(-45)"}); 

    this.svg.select(".y.axis")
        .call(this.yAxis);  

    var bar = this.svg.selectAll(".bar")
        .data(this.displayData);  //, function(d) { return d; });
//

    var bar_enter = bar.enter().append("g");

    bar_enter.append("rect");

    bar
        .attr("class", "bar")
      .style("fill", "blue")
        .attr("transform", function(d,i) {return "translate(" + that.xScale(d.year) + " , " + that.yScale(d.md_pounds) + ")"; });

    bar.exit()
        .remove();

    bar.selectAll("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", function(d) { return that.height - that.yScale(d.md_pounds);})
        .attr("width", (this.width/this.displayData.length)-2) //this.xScale.rangeBand()
        .append("svg:title")
            .text(function(d){ return "year " + d.year + " pounds " + d.md_pounds + " value " + d.md_value + " species " + d.species;});
//    this.yScale
//        .domain([0, d3.max(that.data, function(d) { return d.pounds; })]);

    // updates axis
 //   this.svg.select("path.area")
 //       .attr("d", this.area);

//    this.svg.select(".y.axis")
//        .call(this.yAxis);  
//    this.point.data(this.displayData);
}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
CountVis.prototype.onSelectionChange= function (species){
    console.log(species);
    this.wrangleData(function(d) {return d.species == species;});
    this.updateVis();
}

CountVis.prototype.filterAndAggregate = function(_filter){


    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = _filter;

       /*function(){return true;}
    if (_filter != null){
        filter = _filter;
    } */
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}

    var that = this;
    // create an array of values for prios 0-15

    var res = this.data
        .filter(filter);  
/*
    res.forEach(function(d) {
        d.x = d.year;
        d.y = d.pounds;
    });

    var md = res.filter(function(d) {return d.state == "Maryland";});
    var va = res.filter(function(d) {return d.state == "Virginia";}) 

    res = [md, va]; 

    var stack = d3.layout.stack();
    stack(res);


    console.log(res); */
    // accumulate all values that fulfill the filter criterion

    // TODO: implement the function that filters the data and sums the values
    return res;

}


/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */





/**
 * creates the y axis slider
 * @param svg -- the svg element
 */
CountVis.prototype.addSlider = function(svg){
    /*
    var that = this;

    // TODO: Think of what is domain and what is range for the y axis slider !!
    var sliderScale = d3.scale.linear().domain([1,200]).range([0,200])

    var sliderDragged = function(){
        var value = Math.max(0, Math.min(200,d3.event.y));

        var sliderValue = sliderScale.invert(value);

        // TODO: do something here to deform the y scale
        //console.log("Y Axis Slider value: ", sliderValue);

        that.yScale.exponent(sliderValue/200);

        d3.select(this)
            .attr("y", function () {
                return sliderScale(sliderValue);
            })

        that.updateVis({});
    }
    var sliderDragBehaviour = d3.behavior.drag()
        .on("drag", sliderDragged)

    var sliderGroup = this.svg.append("g").attr({
        class:"sliderGroup",
        "transform":"translate("+-70+","+30+")"
    })

    sliderGroup.append("rect").attr({
        class:"sliderBg",
        x:5,
        width:10,
        height:200
    }).style({
        fill:"lightgray"
    })

    sliderGroup.append("rect").attr({
        "class":"sliderHandle",
        y:200,
        width:20,
        height:10,
        rx:2,
        ry:2
    }).style({
        fill:"#333333"
    }).call(sliderDragBehaviour)
*/

}
