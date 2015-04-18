/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */


/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

/**
 * CountVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @param _eventHandler -- the Eventhandling Object to emit data to (see Task 4)
 * @constructor
 */
CountVis = function(_parentElement, _data, _metaData, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;
    this.displayData = [];

    // TODO: define all "constants" here
    this.margin = {top:20, right:20, bottom:30, left:80};
    this.width = 650 - this.margin.left - this.margin.right;
    this.height = 330 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CountVis.prototype.initVis = function(){

    var that = this; // read about the this

    //TODO: implement here all things that don't change
    this.xScale = d3.time.scale()
        .range([0, this.width]);
    //TODO: implement here all things that need an initial status
    // Examples are:
    // - construct SVG layout

    this.xScale.domain(d3.extent(that.data, function(d) { return d.time; }));

    this.svg = this.parentElement.append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    // - create axis
    this.yScale = d3.scale.pow()
        .exponent(1)
        .range([this.height, 0]); 
    
    this.xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left");   
    // -  implement brushing !!
    this.brush = d3.svg.brush()
        .x(this.xScale)
        .on("brush", function(){
 //           console.log(that.brush.extent());
 //           console.log(that.brush.empty());
            $(that.eventHandler).trigger("selectionChanged", that.brush.extent());
        });

    this.area = d3.svg.area()
        .x(function(d) {return that.xScale(d.time)})
        .y0(this.height)
        .y1(function(d) {return that.yScale(d.count)});
  
    this.path = this.svg.append("path")
        .datum(this.data)
        .attr("class", "area")
        .attr("d", this.area); 

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis);

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("id", "yaxis");

    this.svg.append("g")
            .attr("class", "brush")
        .call(this.brush)
        .selectAll("rect")
            .attr("height", this.height);

    // --- ONLY FOR BONUS ---  implement zooming

    //TODO: implement the slider -- see example at http://bl.ocks.org/mbostock/6452972
    //this.addSlider(this.svg)
    this.addSlider();

    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
}



/**
 * Method to wrangle the data. In this case it takes an options object
  */
CountVis.prototype.wrangleData= function(){

    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    this.displayData = this.data;
}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
CountVis.prototype.updateVis = function(){
    var that = this;
    // TODO: implement update graphs (D3: update, enter, exit)
    this.yScale
        .domain([0, d3.max(that.data, function(d) { return d.count; })]);

    // updates axis
    this.svg.select("path.area")
        .attr("d", this.area);

    this.svg.select(".y.axis")
        .call(this.yAxis);
}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
CountVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

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


}






