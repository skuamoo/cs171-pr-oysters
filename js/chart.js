        $(function(){

            var waterQualityData = [];
            var stationInfoData = [];
            var landingsData = [];
            var chesapeake;
            var selectedYear = 2014;  
            var measure = "TN";
            var xScaleW;
            var yScaleW;
            var yAxisW;
            var stationCount = 0;
            var color = d3.scale.category10();
            var wmax = 0;
            var units = "MG/L";
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            //translations for measure abbreviations
            var measureCode = {"TN": "Total Nitrogen", "TP": "Total Phosphorous", "DO": "Dissolved Oxygen", "SALINITY": "Salinity", "SECCHI": "Secchi Clarity Depth", "WTEMP": "Water Temperature", "PH": "PH"};
            //units for measure abbreviations
            var measureUnits = {"TN": "MG/L", "TP": "MG/L", "DO": "MG/L", "SALINITY": "PPT", "SECCHI": "M", "WTEMP": "Deg C", "PH": "S"};
            var margin = {top:20, right:20, bottom:30, left:80};
            var width = 450 - margin.left - margin.right;
            var height = 250 - margin.top - margin.bottom;
            var demoInfo = [["Choose a measure to apply to all charts", "10px", "48px"], ["Click multiple stations on the map to compare measures", "675px", "250px"], ["Click on a bar to change the year", "230px", "200px"], ["Click and drag the red bar in either graph to change the year", "1000px", "200px"], ["Use the mouse wheel to zoom and pan the comparison graph", "925px", "450px"]];
            var demoItem = 0;
            var demoOn = false;
            var demoCt = 0;
            var depthPosition = 25;
            var oysterOn = 0;
            //clear button for station graph
            d3.select("#clear")
                .on("click", clearWater);

            var initVis = function(){

                d3.select("#selectedYear").text("Chesapeake Bay Water Quality - " + selectedYear).style("font-size", "18px").attr("id", "titleYear");
                //set up buttons for tutorial and info
                var div = d3.select("body").append("div")   
                    .attr("id", "demoButton")               
                    .style("opacity", .9)      
                    .style("left", "800px")     
                    .style("top", "10px")
                    .style("position", "absolute");

                div.append("input").attr("type", "button").attr("value", "Tutorial")
                    .attr("id", "buttonDemo")
                    .style("background-color", "transparent")
                    .on("click", demo);

                div.append("input").attr("type", "button").attr("value", "Bay/Oyster Info")
                    .attr("id", "buttonOyster")
                    .style("background-color", "transparent")
                    .style("position", "relative")
                    .style("left", "10px")
                    .on("click", oysterInfo);

                div.append("input").attr("type", "button").attr("value", "Screencast")
                    .style("background-color", "transparent")
                    .style("position", "relative")
                    .style("left", "20px")
                    .on("click", screencast);

                div.append("input").attr("type", "button").attr("value", "Process Book")
                    .style("background-color", "transparent")
                    .style("position", "relative")
                    .style("left", "30px")
                    .on("click", processBook);

                //draw all charts
                drawYearWater();
                drawMonthWater();
                drawCoast();
                drawOyster();
                drawWaterSetup();
                updateTitles();
            }

            function screencast() {
            //    window.open('https://drive.google.com/file/d/0B-sc-3fkdkpjNHVhNF9yTGVpXzQ/view?usp=sharing');
                window.open('screencast/Kuamoo_CS171_Screencast.mp4');
            } 

            function processBook() {
                window.open('Kuamoo_CS171_Process_Book.pdf');
            }

            function demo() {
                d3.select("#buttonDemo").style("background-color", "yellow");
                demoOn = true;
                var div = d3.select("body").append("div")   
                    .attr("class", "tooltip")
                    .attr("id", "demoBox")               
                    .style("opacity", 0)
                    .on("click", demoNext);

                demoNext();
            }

            function demoNext() {
                var div = d3.select("#demoBox");
                //if demo is finished exit
                if (demoItem >= 5) {
                    div.style("opacity", 0);
                    d3.select("#buttonDemo").style("background-color", "transparent");   
                    demoItem = 0;
                    demoOn = false;       
                    return;        
                }
                //populate demo items from array
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div.html(demoInfo[demoItem][0])  
                    .style("left", demoInfo[demoItem][1])     
                    .style("top", demoInfo[demoItem][2]);  

                demoItem += 1;
            }

            function oysterInfo() {
                //draw oyster info if it hasn't been drawn yet
                if (oysterOn == 0) {
                    d3.select("body").append("div")   
                        .attr("class", "oystertip")
                        .attr("id", "oysterBox")              
                        .style("opacity", 0)
                        .style("left", 100)     
                        .style("top", 0)
                        .style("pointer-events", "all");
                }
                oysterOn = 1;
                var div = d3.select("#oysterBox");
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);
                //set up oyster info html
                div.html("<p style=\"text-align:right\"><input style = 'pointer-events: all' type='button' value='X' onclick=\"document.getElementById('oysterBox').style.opacity = 0; document.getElementById('oysterBox').style.pointerEvents = 'none'\" /></p>The Chesapeake Bay is the largest estuary in North America. The bay was given the Algonquian name <i>Chesepiook</i> meaning 'great shell-fish bay' by Native Americans due to its abundance of oysters<a href='http://msa.maryland.gov/msa/mdmanual/01glance/html/ches.html' target = '_blank'>(1)</a>. Oyster reefs were so plentiful in the bay at one time that European explorers had a difficult time navigating around them and they rose above the surface at low tide<a href='http://www.washingtonpost.com/national/health-science/researchers-think-industrious-oysters-could-clean-up-chesapeake/2013/05/05/1778a79c-b353-11e2-9a98-4be1688d7d84_story.html' target='_blank'>(2)</a>. Oysters brought such a high profit to towns on the Chesapeake that they became known as 'Chesapeake Gold' during plentiful years such as 1898 when oystermen in Maryland alone landed 5.3 billion oysters<a href='http://www.pbs.org/newshour/rundown/restoring-the-gold-of-the-chesapeake-bay/' target='_blank'>(3)</a>.<p/>Because of the incredible filtering capability of oysters the bay was crystal clear during the time when oysters were plentiful. An acre of oysters can filter 140 million gallons of water an hour and remove 3,000 pounds of nitrogen, a primary pollutant, per year<a href='http://www.pbs.org/newshour/rundown/restoring-the-gold-of-the-chesapeake-bay/' target='_blank'>(4)</a>. An adult oyster has the capability to filter about 50 gallons of water per day. Since the Chesapeake Bay contains 18 trillion gallons of water, that means it would take about 20 billion oysters to keep it completely clean. While there were easily that many oysters in the bay in the 19th century, this is no longer the case. The following time lapse video shows how effective oysters are at filtering water:<p /><center><iframe opacity=1 width=280 height=210 src='https://www.youtube.com/embed/1Zm-yMpHsaQ' frameborder=0></iframe><br /><sup>Source: The Chesapeake Bay Foundation '<a href='https://www.youtube.com/watch?v=1Zm-yMpHsaQ' target='_blank'>Common Ground</a>' documentary</sup></center><p />The oyster population plummeted in the 1980s due to a combination of overharvesting, pollution, and disease. Sadly as the oyster population continues to decrease, pollution of the bay continues to rise. The Chesapeake Bay watershed ncludes 64,000 square miles across six states (Maryland, Delaware, Pennsylvania, New York, Virginia, West Virginia-and the District of Columbia) with an unusually high amount of farmland (around 25% of the total land area). As a result, agriculture is the most significant source of water pollution of the bay. Nitrogen and phosphorous are the two leading pollutants that enter the bay from runoff from farms, cities, suburbs, and air pollution, and create harmful conditions for bay grasses and aquatic life<a href='http://chesapeake.news21.com/content/sources-pollution-chesapeake-bay' target='_blank'>(5)</a>.<p />Efforts to clean the bay and restore the oyster population are critical before it reaches a point of no return. <a href='http://www.cbf.org/' target='_blank'>Save the Bay</a>"); 
            }

            function drawCoast() {

                var margin = {top:20, right:20, bottom:30, left:80};
                var width = 310 - margin.left - margin.right;
                var height = 700 - margin.top - margin.bottom;

                var svg = d3.select("#bayVis").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);
                //TOPOjson projection centered and zoomed on the bay
                var projection = d3.geo.mercator().scale(10000)
                    .center([-74.6,38.5]);

                var path = d3.geo.path()
                    .projection(projection);

                var topo = topojson.feature(chesapeake, chesapeake.objects.shore_dd);

                svg.selectAll("path")
                    .data(topo.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", "lightblue");
                //draw stations
                var node = svg.selectAll(".station")
                    .data(stationInfoData)
                    .enter()
                    .append("g").attr("class", "station");
        
                var circle = node.append("circle")
                    .attr("r", 5)
                    .style("cursor", "pointer")
                    .style("stroke", "white")
                    .attr("fill", "black")
                    .attr("opacity", 0.8);
        
                var stationid = node.append("text")
                    .text(function(d) {return d.station;})
                    .attr("x", function() {return 8;})
                    .attr("y", function() {return 3;})
                    .attr("transform", function() {
                        return "rotate(-15)" 
                    })
                    .attr("opacity", 0)
                    .attr("fill", "red")
                    .attr("stroke", "red");

                node
                    .on("mouseover", function(d) {
                        d3.select(this).selectAll("circle").classed("hoverStation", true);
                        d3.select(this).selectAll("text").classed("hoverStation", true);
                    })
                    .on("mouseout", function() {
                        d3.select(this).selectAll("circle").classed("hoverStation", false);
                        d3.select(this).selectAll("text").classed("hoverStation", false);
                    })
                    .on("click", function(d) { 
                        drawWater(d.station);
                        pathVisible();
                        d3.select(this).selectAll("circle").classed("hoverStation", false);
                        d3.select(this).selectAll("circle").classed("clickedStation", true).attr("fill", function(d) {return color(stationCount);})
                        d3.select(this).selectAll("text").classed("clickedStation", true);
                    });

                node.append("svg:title")
                    .text(function(d) {return d.description + " (" + d.county + " county)";});

                node.transition().duration(500)
                    .attr("transform", function(d) { 
                        return "translate("+projection([d.lon, d.lat])[0]+","+projection([d.lon, d.lat])[1]+")"; 
                    });
            }

            function drawOyster() {
                //select Maryland oyster landings from data set
                var oystermd = landingsData.filter(function(d) { return d.species == "Oyster" && d.state == "Maryland";});

                var xScale = d3.scale.linear().range([0, width])
                    .domain([1929, 2014]);
                var yScale = d3.scale.linear()
                    .range([height, 10])
                    .domain([0, d3.max(oystermd, function(d) { return d.pounds; })]);

                var svg = d3.select("#oysterVis").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                svg.append("text").text("Maryland Oyster Landings by Year (Pounds of Meat)").attr("x", 40).attr("y", 0).style("font", "12px sans-serif");

                var line = d3.svg.line()
                    .x(function(d) { return xScale(d.year); })
                    .y(function(d) { return yScale(d.pounds); });
        
                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .tickFormat(d3.format("d"));

                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left");  
         
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("id", "yaxis")
                    .call(yAxis);

                svg.append("path")
                    .datum(oystermd)
                    .attr("class", "line")
                    .attr("d", line);
                //add drag behavior to year line
                var drag = d3.behavior.drag() 
                    .on("drag", function () {
                        var x = d3.event.x;

                        if (x >= xScale(1984) && x <= xScale(2014)) {
                            d3.select(this)
                                .attr("x1", x)
                                .attr("x2", x);
                            selectedYear = parseInt(xScale.invert(x));
                            d3.select("#yearText")
                                .attr("x", x-25)
                                .attr("opacity", 1)
                                .text(selectedYear);
                            if(demoOn && demoItem == 4) {
                                demoNext();
                            }
                        }

                    })
                    .on("dragend", function() {
                        d3.select("#yearText")
                            .attr("opacity", 0);
                        changeYear(selectedYear);
                    });
                //add year line
                svg.append("line")
                    .attr("id", "oysterLine")
                    .attr("x1", xScale(selectedYear))  
                    .attr("y1", 0)
                    .attr("x2", xScale(selectedYear))  
                    .attr("y2", height)
                    .attr("stroke-width", 3)
                    .attr("stroke", "red")
                    .attr("fill", "red")
                    .attr("opacity", 0.8)
                    .style("cursor", "pointer")
                    .call(drag);
                //add changing year label to line
                svg.append("text")
                    .text(selectedYear)
                    .attr("id", "yearText")
                    .attr("x", xScale(selectedYear)-25)
                    .attr("y", height/2)
                    .attr("opacity", 0);

            }

            function updateOyster() {
            //update position of draggable line
                var xScale = d3.scale.linear().range([0, width])
                    .domain([1929, 2014]);

                d3.select("#oysterLine")
                    .transition()
                    .attr("x1", xScale(selectedYear))  
                    .attr("x2", xScale(selectedYear));  
            }

            function drawWaterSetup() {

                var margin = {top:20, right:30, bottom:30, left:80};
                var width = 450 - margin.left - margin.right;
                var height = 280 - margin.top - margin.bottom;
                var padding = 10;

                var svg = d3.select("#waterVis").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("class","water")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                svg.append("text").attr("x", 85).attr("y", 0).attr("id", "stationText").style("font", "12px sans-serif");
                svg.append("text").attr("x", 70).attr("y", 10).style("font", "9px sans-serif").text("Surface (dotted line) and Bottom (solid line) Measures");
                svg.append("text").attr("x", width-8).attr("y", 10).style("font", "9px sans-serif").text("Depth(M)");

                svg.append("text").text("Click multiple stations to compare").attr("x", 100).attr("y", 100).attr("id", "stationClick");
                //filter data for currently selected measure
                var water = waterQualityData.filter(function(d) { return d.parameter == measure;});

                xScaleW = d3.time.scale()
                    .range([0, width])
                    .domain([new Date(1984,1,1), new Date(2014, 12, 31)]);

                yScaleW = d3.scale.linear()
                    .range([height, 10]);

                var xAxis = d3.svg.axis()
                    .scale(xScaleW)
                    .orient("bottom");

                yAxisW = d3.svg.axis()
                    .scale(yScaleW)
                    .orient("left");  
        
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("id", "xaxw")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("id", "yaxw");
//add drag behavior for year line
                var drag = d3.behavior.drag()
                    .on("drag", function () {
                        var x = d3.event.x;

                        d3.select(this)
                            .attr("x1", x)
                            .attr("x2", x);
                        selectedYear = (xScaleW.invert(x)).getFullYear();

                        d3.select("#yearTextW")
                            .attr("x", x-25)
                            .attr("opacity", 1)
                            .text(selectedYear);                     

                    })
                    .on("dragend", function() {
                        d3.select("#yearTextW")
                            .attr("opacity", 0);
                        changeYear(selectedYear);
                        if (demoOn && demoItem == 4) {
                            demoNext();
                        }
                    });

                svg.append("text")
                    .text(selectedYear)
                    .attr("id", "yearTextW")
                    .attr("x", xScaleW(new Date(selectedYear, 1, 1))-25)
                    .attr("y", height/2)
                    .attr("opacity", 0);
                //add zoom behavior for chart (x-axis only)
                var zoom = d3.behavior.zoom()
                    .x(xScaleW)
                    .scaleExtent([1, 10])
                    .size([width, height])
                    .on("zoom", function() {
                        svg.select("g.x.axis").call(xAxis);
                        svg.select("g.y.axis").call(yAxisW);
                        svg.selectAll(".stationPath").attr("d", line);
                        d3.select("#stationLine")
                            .transition()
                            .attr("x1", xScaleW(new Date(selectedYear, 1, 1)))  
                            .attr("x2", xScaleW(new Date(selectedYear, 1, 1))); 
                        if (demoOn && demoItem == 5) {
                            demoNext();
                        }
                    })

                svg.append("rect")
                    .attr("class", "pane")
                    .attr("width", width)
                    .attr("height", height)
                    .call(zoom);

                svg.append("clipPath")
                    .attr("id", "chart-area")
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height);
                //add draggable year line
                svg.append("line")
                    .attr("id", "stationLine")
                    .attr("x1", xScaleW(new Date(selectedYear, 1, 1)))  
                    .attr("y1", 0)
                    .attr("x2", xScaleW(new Date(selectedYear, 1, 1)))  
                    .attr("y2", height)
                    .attr("stroke-width", 3)
                    .attr("stroke", "red")
                    .attr("fill", "red")
                    .attr("opacity", 0.8)
                    .style("cursor", "pointer")
                    .call(drag);

                var line = d3.svg.line()
                    .x(function(d) { return xScaleW(d.date); })
                    .y(function(d) { return yScaleW(d.mvalue); });

            }

            function drawWater(station) {
                //if user clicks correct item during demo go to next demo item
                if(demoOn && demoItem == 2) {
                    demoCt += 1;
                    if (demoCt > 1) {
                        demoCt = 0;
                        demoNext();
                    }
                }

                d3.select("#stationClick").style("opacity", 0);
                //track station number
                stationCount += 1;
                //filter surface and bottom data
                var water = waterQualityData.filter(function(d) { return d.station == station && d.parameter == measure;});
                var water_b = waterQualityData.filter(function(d) { return d.station == station && d.mlayer == "B" && d.parameter == measure;});
                var water_s = waterQualityData.filter(function(d) { return d.station == station && d.mlayer == "S" && d.parameter == measure;});
                //get max value of all lines for yScale domain
                var stationmax = d3.max(water, function(d) { return d.mvalue; });
                if (stationmax > wmax) {
                    wmax = stationmax;
                }

                var svg = d3.select("g.water");

                yScaleW
                    .domain([0, wmax]);

                var line = d3.svg.line()
                    .x(function(d) { return xScaleW(d.date); })
                    .y(function(d) { return yScaleW(d.mvalue); });

                svg.select("#yaxw")
                    .call(yAxisW);

                d3.selectAll(".stationPath")
                    .transition()
                    .attr("d", line);
                //plot bottom measurements
                svg.append("path")
                    .datum(water_b)
                    .attr("class", "wbottom stationPath")
                    .attr("clip-path", "url(#chart-area)")
                    .style("stroke", function() {return color(stationCount);})
                    .attr("d", line);
                //plot surface measurements with dotted line
                svg.append("path")
                    .datum(water_s)
                    .attr("class", "wsurface stationPath")
                    .attr("clip-path", "url(#chart-area)")
                    .style("stroke-dasharray", ("3, 3"))
                    .style("stroke", function() {return color(stationCount);})
                    .attr("d", line);
                //display station depths
                svg.append("text")
                    .attr("transform", "translate(" + (width-8) + "," + depthPosition + ")")//yScaleW(water_b[water_b.length - 1].mvalue) + ")")
                    .attr("dy", ".25em")
                    .attr("text-anchor", "start")
                    .style("fill", function() {return color(stationCount);})
                    .text(function(d) {return water_b[water_b.length - 1].depth;});
 
                depthPosition += 15;                      
            }

            function updateWaterStation() {
            //update position of draggable line
                var xScale = d3.time.scale()
                    .range([0, width])
                    .domain([new Date(1984,1,1), new Date(2014, 12, 31)]);
                //update values
                d3.select("#stationLine")
                    .transition()
                    .attr("x1", xScale(new Date(selectedYear, 1, 1)))  
                    .attr("x2", xScale(new Date(selectedYear, 1, 1))); 
            }

            function clearWater() {
                //clear station measures chart
                d3.select("#waterVis").select("svg").remove();
                drawWaterSetup();
                d3.select("#stationClick").style("opacity", 1);
                d3.selectAll("text").classed("clickedStation", false);
                d3.selectAll("circle").classed("clickedStation", false).attr("fill", "black").attr("opacity", 0.8);
                wmax = 0;
                updateTitles();
                depthPosition = 25;
            }

            function aggregateData(layer, aggType) {
                var water;
                var waterYear;
                //aggregate data by month for monthly chart and by year for yearly chart
                if (aggType == "month") {
                    water = waterQualityData.filter(function(d) { return d.year == selectedYear && d.mlayer == layer && d.parameter == measure;});
                    waterYear = d3.nest()
                        .key(function(d) {return d.month;})
                        .rollup(function(d) {return [
                            d3.mean(d, function(d) {return parseFloat(d.mvalue);})
                        ]})
                        .entries(water);        
                    waterYear = waterYear.map(function(d) {
                        var res = {
                            year: selectedYear,
                            month: d.key,
                            mvalue: d.values[0]
                        }
                        return res;
                    });
                }
                else {
                    water = waterQualityData.filter(function(d) { return d.mlayer == layer && d.parameter == measure;});

                    waterYear = d3.nest()
                        .key(function(d) {return d.year;})
                        .rollup(function(d) {return [
                            d3.mean(d, function(d) {return parseFloat(d.mvalue);})
                        ]})
                        .entries(water);         
                    waterYear = waterYear.map(function(d) {
                        var res = {
                            year: d.key,
                            mvalue: d.values[0]
                        }
                        return res;
                    });
                }
                return waterYear;
            }

            function drawMonthWater() {
                //get monthly bottom and surface data
                var waterYearB = aggregateData("B", "month");
                var waterYearS = aggregateData("S", "month");
                //calculate max value for scale
                var maxVal = Math.max(d3.max(waterYearB, function(d) { return d.mvalue;}), d3.max(waterYearS, function(d) { return d.mvalue;}));

                var xScale = d3.scale.linear().range([0, width])
                    .domain([1, 12]);
                var yScale = d3.scale.linear()
                    .range([height, 10])
                    .domain([0, maxVal]);

                var svg = d3.select("#monthWaterVis").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                svg.append("text").attr("x", 100).attr("y", 0).attr("id", "monthText").style("font", "12px sans-serif");
                svg.append("text").attr("x", 100).attr("y", 10).style("font", "9px sans-serif").text("Surface (dotted line) and Bottom (solid line) Measures");

                var line = d3.svg.line()
                    .x(function(d) { return xScale(d.month); })
                    .y(function(d) { return yScale(d.mvalue); });

                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .tickFormat(function(i) { return months[i-1];}); 

                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left"); 
                //draw surface and bottom paths
                svg.append("path")
                    .attr("id", "monthPathB")
                    .datum(waterYearB)
                    .attr("class", "line")
                    .style("stroke", "blue")
                    .attr("d", line);  

                svg.append("path")
                    .attr("id", "monthPathS")
                    .datum(waterYearS)
                    .attr("class", "line")
                    .style("stroke-dasharray", ("3, 3"))
                    .style("stroke", "blue")
                    .attr("d", line);                     
      
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("id", "yaxism")
                    .call(yAxis);   
            }

            function updateMonthWater() {
                var waterYearB = aggregateData("B", "month");
                var waterYearS = aggregateData("S", "month");
                //if water clarity is selected only show surface data (no bottom measurements for this measure)
                if (measure == "SECCHI") {
                    var maxVal = d3.max(waterYearS, function(d) { return d.mvalue;});
                }  else {  
                    var maxVal = Math.max(d3.max(waterYearB, function(d) { return d.mvalue;}), d3.max(waterYearS, function(d) { return d.mvalue;}));
                }

                var xScale = d3.scale.linear().range([0, width])
                    .domain([1, 12]);
                var yScale = d3.scale.linear()
                    .range([height, 10])
                    .domain([0, maxVal]);

                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left"); 

                d3.select("#yaxism")
                    .call(yAxis);     

                var line = d3.svg.line()
                    .x(function(d) { return xScale(d.month); })
                    .y(function(d) { return yScale(d.mvalue); });

                d3.select("#monthPathS")
                    .datum(waterYearS)
                    .transition()
                    .attr("d", line);  
                //if water clarity selected hide bottom line
                if (measure == "SECCHI") {
                    d3.select("#monthPathB")
                        .attr("opacity", 0);
                } else {
                    d3.select("#monthPathB")
                        .datum(waterYearB)
                        .transition()
                        .attr("d", line)
                        .attr("opacity", 1);  
                }
            }

            function drawYearWater() {
                //aggregate yearly data for surface measurements
                var waterYear = aggregateData("S", "year");

                var xScale = d3.scale.linear().range([0, width])
                    .domain([1984, 2014]);
                var yScale = d3.scale.linear()
                    .range([height, 10])
                    .domain([0, d3.max(waterYear, function(d) { return d.mvalue; })]);

                var svg = d3.select("#yearWaterVis").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                svg.append("text").attr("x", 100).attr("y", 0).attr("id", "yearGraphText").style("font", "12px sans-serif");
                svg.append("text").attr("x", 150).attr("y", 10).style("font", "9px sans-serif").text("Surface Measures");
                //draw bars for each year
                var bar = svg.append("g").selectAll(".bar")
                    .data(waterYear)
                    .enter()
                    .append("rect")
                    .attr("class", function(d) {if (d.year == selectedYear) {return "bar clickedYear";} else {return "bar";}})
                    .attr("fill", "blue") //function(d) {if (d.year == selectedYear) {return "red";} else {return "blue";}})
                    .style("cursor", "pointer")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 10)
                    .attr("height", function(d){return height - yScale(d.mvalue)})
                    .attr("transform", function(d) {return "translate(" + xScale(d.year) + "," + yScale(d.mvalue) + ")"; });
                //show year labels on mouseover
                svg.append("text")
                    .text(selectedYear)
                    .attr("id", "yearID")
                    .attr("x", 0)
                    .attr("y", 10)
                    .attr("fill", "black")
                    .attr("opacity", 0);
                //set mouse events and make bars clickable to change year for other charts
                bar
                    .on("mouseover", function(d){
                        d3.select(this).classed("hoverYear", true);
                        d3.select("#yearID")
                            .text(d.year)
                            .attr("opacity", 1)
                            .attr("x", xScale(d.year)-5)
                            .attr("y", yScale(d.mvalue)-5);
                    })
                    .on("mouseout", function(d){
                        d3.select(this).classed("hoverYear", false);
                        d3.select("#yearID")
                            .attr("opacity", 0);
                    })
                    .on("click", function(d){
                        d3.selectAll(".bar").classed("clickedYear", false);
                        d3.select(this).classed("hoverYear", false);
                        d3.select(this).classed("clickedYear", true);
                        selectedYear = d.year;  //need parseInt?
                        changeYear(d.year);
                        if(demoOn && demoItem == 3) {
                            demoNext();
                        }
                    });

                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .tickFormat(d3.format("d"));

                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left"); 

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("id", "yaxisy")
                    .call(yAxis);     
            }

            function updateYearWater() {

                var water = aggregateData("S", "year");

                var xScale = d3.scale.linear().range([0, width])
                    .domain([1984, 2014]);

                var yScale = d3.scale.linear()
                    .range([height, 10])
                    .domain([0, d3.max(water, function(d) { return d.mvalue; })]);

                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left");

                d3.select("#yaxisy")
                    .call(yAxis);  
                //update all bars
                d3.selectAll(".bar")
                    .data(water)
                    .attr("height", function(d){return height - yScale(d.mvalue);})
                    .attr("transform", function(d) {return "translate(" + xScale(d.year) + "," + yScale(d.mvalue) + ")"; })
                    .on("mouseover", function(d){
                        d3.select(this).classed("hoverYear", true);
                        d3.select("#yearID")
                            .text(d.year)
                            .attr("opacity", 1)
                            .attr("x", xScale(d.year)-5)
                            .attr("y", yScale(d.mvalue)-5);
                    }); 
            }

            function changeYear (year) {
                //update all charts for change of selected year
                selectedYear = year;
                updateMonthWater();
                updateOyster();
                updateWaterStation();

                d3.select("#titleYear")
                    .text("Chesapeake Bay Water Quality - " + selectedYear);

                d3.selectAll(".bar")
                    .classed("clickedYear", function(d) {if(d.year == selectedYear) {return true;} else {return false;}});
            }

            function changeMeasure(measure) {
                //update all charts for change of measure
                updateMonthWater();
                updateYearWater();
                clearWater();
                //if tutorial task accomplished move to next tutorial task
                if(demoOn && demoItem == 1) {
                    demoNext();
                }
            }

            function updateTitles() {
                //update all chart titles
                d3.selectAll("#monthText")
                    .text("Monthly " + measureCode[measure] + " Averages (" + measureUnits[measure] + ")");

                d3.selectAll("#yearGraphText")
                    .text("Yearly " + measureCode[measure] + " Averages (" + measureUnits[measure] + ")");

                d3.selectAll("#stationText")
                    .text(measureCode[measure] + " by Station (" + measureUnits[measure] + ")");

            }

            var dataLoaded = function (error, _waterQuality, _stationInfo, _landings, _topomap) {
                $('.loading').hide()
                if (!error) {
                    //wrangle data
                    landingsData = _landings.map(function(d) {
                        var res = {
                            year: parseInt(d.Year),
                            pounds: parseInt(d.Pounds),
                            value: parseInt(d.Value),
                            state: d.State,
                            species: d.Species
                        }

                        return res;

                    });

                    stationInfoData = _stationInfo.map(function(d) {
                        var res = {
                            station: d.Station,
                            description: d.Station_Description,
                            fips: d.FIPS,
                            county: d.County_City,
                            lat: d.Latitude,
                            lon: d.Longitude
                        }

                        return res;
                    });

                    waterQualityData = _waterQuality.map(function(d) {
                        var res = {
                            station: d.Station,
                            month: d.Month,
                            year: d.Year,
                            date: new Date(d.Year, d.Month),
                            depth: d.Total_Depth,
                            mlayer: d.Layer,
                            parameter: d.Parameter,
                            mvalue: parseFloat(d.MeasureValue),
                            unit: d.Unit,
                            lat: d.Lat,
                            lon: d.Long
                        }
                        return res;
                    });
                    //set global variable to hold data from coastline topojson file
                    chesapeake = _topomap;

                    initVis(); 
                }
            }

            var startHere = function(){
                //load all data
                queue()
                    .defer(d3.csv, 'data/WaterQualityFullClean.csv')
                    .defer(d3.csv, 'data/StationInfoAll.csv')
                    .defer(d3.csv, 'data/OysterCrabLandings.csv')
                    .defer(d3.json, 'data/shapefile/chesapeaketopo4.json')
                    .await(function(error, waterQuality, stationInfo, landings, topomap) {
                        dataLoaded(error, waterQuality, stationInfo, landings, topomap);
                    });
            }

            d3.selectAll("input.level")
                .on("change", function() {
                    pathVisible();
                });

            function pathVisible() {
                //enable surface and bottom data selection in station chart
                   if(d3.select("#checkSurface").node().checked) {
                        d3.selectAll("path.wsurface")
                            .style("opacity", 1);
                    } else {
                        d3.selectAll("path.wsurface")
                            .style("opacity", 0);                    
                    }

                    if(d3.select("#checkBottom").node().checked) {
                        d3.selectAll("path.wbottom")
                            .style("opacity", 1);
                    } else {
                        d3.selectAll("path.wbottom")
                            .style("opacity", 0);                    
                    }                
            }
            //listener for changing measures
            d3.selectAll("input.measure")
                .on("change", function() {
                    measure = d3.select(this).property("value");
                    changeMeasure(measure);
                }); 

            startHere();
        })