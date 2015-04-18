# cs171-pr-oysters

Notes:

Use the chart.html file as the most up to date version of the layout. I am working on moving the data loading into a queue and the graph drawing into separate functions in chart2.html but this file is not functional yet. All data is in chart1.html but the water quality views are not yet drawn because I am working out how to deal with the magnitude of the data. 

The chesapeake.html file has just the shapefile drawn via topoJSON and water stations plotted. The projection function was not working correctly for plotting the water quality stations (it was giving me coordinates of 30000) so I had to use xScale and yScale to plot them and line them up with the map. 

The oysters.html file has a barchart for oyster landings by year. I ended up going with a scatterplot (in chart.html) instead because I thought it showed the trends better.

My new design drawing is in my process book.
