OysterVis = function(_parentElement, _data, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.displayData = [];

    this.margin = {top:20, right:20, bottom:30, left:80};
    this.width = 600 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
}

OysterVis.prototype.initVis = function(){

    var that = this;

    this.xScale = d3.scale.linear().range([0, this.width]);
    this.yScale = d3.scale.pow()
        .exponent(1)
        .range([this.height, 0]);

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
        .attr("class", "y axis")
        .attr("id", "yaxis");

    this.wrangleData(function(d) {return d.species == "Oyster";});

    this.updateVis();
}

OysterVis.prototype.wrangleData= function(_filterFunction){
    this.displayData = this.filterAndAggregate(_filterFunction);
}

OysterVis.prototype.updateVis = function(){
    var that = this;

    this.xScale.domain([d3.min(that.displayData, function(d) { return d.year; }), d3.max(that.displayData, function(d) { return d.year; })]);
    this.yScale.domain([0, d3.max(that.displayData, function(d) { return d.md_pounds; })]);

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
        .data(this.displayData); 
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
        .attr("width", (this.width/this.displayData.length)-2) 
        .append("svg:title")
            .text(function(d){ return "year " + d.year + " pounds " + d.md_pounds + " value " + d.md_value + " species " + d.species;});

OysterVis.prototype.onSelectionChange= function (species){
    console.log(species);
    this.wrangleData(function(d) {return d.species == species;});
    this.updateVis();
}

OysterVis.prototype.filterAndAggregate = function(_filter){

    var filter = _filter;
    var that = this;
    var res = this.data
        .filter(filter);  
    return res;
}