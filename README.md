# A4-Nobel-Works

Take an [interactive tour](https://github.mit.edu/pages/6894-sp20/A4-Nobel-Works/) through the noble achievements of some of the world's brightest stars!

## Design Rationale
Our chosen dataset of Nobel laureate publication records contained a wide range of fields, including the Nobel laureates' names, affiliations, and disciplines in which they were awarded the Nobel prize, in addition to the publication name, year, and journal of all recorded publications by each laureate. Thus, we decided to emphasize different aspects of the data using a step-by-step approach, beginning with a broad overview, and then diving into some finer details. We produced 3 main figures to tell the story of this dataset.

### Nobel Constellations
The available data reflected Nobel laureates of three disciplines: chemistry, medicine, and physics. Each discipline encompassed around 200-250 laureates, some with mutual affiliations. Thus, we decided to create an exploratory visualization to examine how different affiliations were represented among the three disciplines, and how many works their affiliated Nobel laureates had published. The hierarchical nature of this data prompted us to create a visual of packed circles which can be zoomed to reveal more detailed information, from the level of a discipline, to the institution, to the individual Nobel laureate. We scaled the areas of the circles by the total number of publications for each laureate to date. The preliminary result reminded us of grouped stars – constellations – so we chose a color scheme to reflect the sky with the laureates as stars.

### Nobel Lights
Another key signature of the dataset was time, such as the publication years of Nobel laureates’ works. We thought it would be interesting to plot the trajectory of the laureates’ publication records over time, and highlight at what point in their career a Nobel prize-winning work was published. Due to the large number of institutions and laureates represented in the data, we chose a simpler approach and filtered out 12 institutions which were among the largest in number of affiliated laureates. For each institution, we plotted the publication count of each laureate as a function of time in 4-year intervals, and stacked the results to produce a streamgraph. We overlaid this plot with scattered points indicating the publication year of a laureate's prize-winning work(s), colored by discipline, with the area scaled by the number of such publications occurring in that time interval. The interactive features in this visualization included filtering to select a desired institution using the dropdown menu, and tooltips to reveal laureate information when hovering over a particular stream.

### Nobel Stars
For the last visualization, we wanted to draw attention to the prize-winning publications, also for selected institutions. Specifically, we sought to illuminate potential patterns between the year a work was published, and the year its author received the Nobel prize. Each scattered point marks a prize-winning publication colored by the discipline in which the Nobel prize was awarded. The x-axis denotes the year of publication, and the y-axis indicates the year the Nobel prize was awarded. By clicking and dragging an area selection, we can highlight and magnify the publications in the corresponding window across all institutions. Brushing was chosen as the main interactive technique for this plot in order to readily compare the data across all institutions.

Finally, we included a thin panel beside each visualization to guide users in interpreting and exploring the visualization. Our overall color and encoding schemes for the webpage are intended to emulate stars in the sky, as Nobel laureates may be regarded as shining stars in their fields.

## Development Process
We began by doing an exploratory analysis of the data using different platforms such as Tableau and python, which we used to define the variables of interest for our visualizations. Then, we discussed ideas for the main encoding strategies, including the zoomable bubble diagram, streamgraph, and array of scatter plots. We generated preliminary graphs in Observable notebooks using either D3 or Vega-Lite, providing feedback to one another along the way. Once we had finalized the visualization code in the notebooks, we migrated it to a final javascript file and incorporated it into the html script on our Github repository. Other interactive and design components, such as the dropdown menu, overall color scheme, and side panel, were added along the way. Generally, the most time-consuming and challenging part was writing and debugging the code. Our team had no prior experience with html/css/javascript or D3, so we balanced the implementation complexity of our visualization and focused on ensuring the most important functionalities were successful.

### Ameneh
- Exploratory analysis (Tableau): 4 hours
- Data wrangling (Tableau and Excel): 2 hours
- Visualization in Observable (D3 and Vega-Lite), including learning basic javascript: 35 hours

### Nina
- Exploratory analysis (Tableau): 2-3 hours
- Data wrangling and processing (python): 10 hours
- Visualization in Observable (D3), including learning basic html/css/javascript: 45-50 hours
- Webpage construction (html/css): 4-5 hours


## References
### Data Source
- Publication detailing data curation: https://www.nature.com/articles/s41597-019-0033-6
- Data download: https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/6NJ5RN

### Visualization Resources
- Zoomable circle packing: https://bl.ocks.org/fdlk/076469462d00ba39960f854df9acda56
- Streamgraph: http://bl.ocks.org/WillTurman/4631136
- Brushable scatterplot: https://observablehq.com/@d3/brushable-scatterplot-matrix
