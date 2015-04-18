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
 * AgeVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */
AgeVis = function(_parentElement, _data, _metaData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];



    // TODO: define all constants here
    this.margin = {top: 20, right: 20, bottom: 30, left: 50};
    this.width = 230 - this.margin.left - this.margin.right;
    this.height = 330 - this.margin.top - this.margin.bottom;

    this.initVis();

}


/**
 * Method that sets up the SVG and the variables
 */
AgeVis.prototype.initVis = function(){

    var that = this; // read about the this


    //TODO: construct or select SVG
    //TODO: create axis and scales
    this.xScale = d3.scale.linear().range([0, this.width]);
    this.yScale = d3.scale.linear().range([0, this.height])
        .domain([0,99]);
    this.svg = this.parentElement.append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left");

//    this.dateFormatter = d3.time.format("%Y-%m-%d");

 //     this.xScale.domain([0, d3.max(dataAges, function(d) { return d; })]);
 //   this.yScale.domain([99, 0]);  

    this.area = d3.svg.area()
        .x0(0)
        .x1(function(d) {return that.xScale(d);})
//        .y0(this.height)
        .y(function(d, i) {return that.yScale(i);});
/*  
    var path = svg.append("path")
        .datum(dataAges)
        .attr("class", "area")
        .attr("d", area); */
    this.path = this.svg.append("path");

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("id", "yaxis");

    // filter, aggregate, modify data
    this.wrangleData(null);

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
 * @param _filterFunction - a function that filters data or "null" if none
 */
AgeVis.prototype.wrangleData= function(_filterFunction){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate(_filterFunction);
//    this.displayData = this.data;
    //// you might be able to pass some options,
    //// if you don't pass options -- set the default options
    //// the default is: var options = {filter: function(){return true;} }
    //var options = _options || {filter: function(){return true;}};

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 */
AgeVis.prototype.updateVis = function(){
    var that = this;
    // Dear JS hipster,
    // you might be able to pass some options as parameter _option
    // But it's not needed to solve the task.
    // var options = _options || {};

    // TODO: implement...
    // TODO: ...update scales
    // TODO: ...update graphs
    this.xScale.domain([0, d3.max(that.displayData, function(d) { return d; })]);
//console.log(this.displayData[0]);
    this.svg.select(".y.axis")
        .call(this.yAxis);

    this.path
        .datum(this.displayData)
        .attr("class", "area")
        .attr("d", this.area);

}


/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
AgeVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){
    // TODO: call wrangle function
    this.brushEmpty = false;
    if(selectionStart - selectionEnd == 0) {
            this.brushEmpty = true;
    }
    this.wrangleData(function(d) {return d.time >= selectionStart && d.time <= selectionEnd;});
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
AgeVis.prototype.filterAndAggregate = function(_filter){


    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;}
    if (_filter != null && this.brushEmpty == false){
        filter = _filter;
    }
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}

    var that = this;
    // create an array of values for age 0-100
    var res = d3.range(100).map(function () {
        return 0;
    });

//    var count = 0;

    this.data
        .filter(filter)
        .forEach(function(d) {
//            count += d.count;
            for(var i=0; i< d.ages.length; i++){
                res[i] += d.ages[i];
            }
        });    
    // accumulate all values that fulfill the filter criterion

    // TODO: implement the function that filters the data and sums the values
    return res;

}




