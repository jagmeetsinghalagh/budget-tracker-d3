// dimensions and margins.
const svgDimensions = { height: 500, width: 500 };
const radius = 175;
const graphHeight = 2*radius;
const graphWidth = 2*radius;

const svg = d3.select('.canvas')
    .append('svg')
        .attr('width', svgDimensions.width)
        .attr('height', svgDimensions.height);

const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${radius},${radius+50})`);

const legendGroup = svg.append('g')
    .attr('transform',`translate(${graphWidth},50)`);

const tooltip = d3.select('body')
    .append('div')
        .attr('class','tooltip')
        .style('opacity',0);

const pieGenerator = d3.pie()
    .sort(null)
    .value(data => data.expense);

const arcGenerator = d3.arc()
    .innerRadius(radius/4)
    .outerRadius(3*radius/4);

const colorGenerator = d3.scaleOrdinal(d3['schemeSet3']);

const legend = d3.legendColor()
    .shape('circle')
    .scale(colorGenerator)
    .shapePadding(10);

const update = (data) => {

    // updating the domain of the scales.
    colorGenerator.domain(data.map(item => item.name));

    // update and call the legend.
    legendGroup.call(legend);
    legendGroup.selectAll('text')
        .attr('fill','white');
    
    // join updated data to the DOM.
    const paths = graph.selectAll('path')
        .data(pieGenerator(data));

    // remove the unwanted shapes using exit selection.
    paths.exit()
        .transition().duration(2000)
            .attrTween('d', arcTweenExit)
        .remove();

    // update the current shapes
    paths
        .attr('fill', d => colorGenerator(d.data.name))
        .attr('stroke', 'white')
        .attr('stroke-width', '2')
        .transition().duration(750)
            .attrTween('d', arcTweenUpdate);

    // append the elements from enter selection to DOM.
    paths.enter()
        .append('path')
            .attr('fill', d => colorGenerator(d.data.name))
            .attr('stroke', 'white')
            .attr('stroke-width', '2')
            .each( function(d){ this._current = d})
            .transition().duration(1000)
                .attrTween('d', arcTweenEnter);

    graph.selectAll('path')
        .on("mouseover", function(d){
            console.log("Hovered In");
            tooltip.transition()
                .duration(500)
                .style('opacity',0.9);
            tooltip.html("Name: " + d.data.name + "<br>" + "Expense: " + d.data.expense + "<br>Click to delete." )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function(d) {
            console.log("Hovered out");		
            tooltip.transition()		
                .duration(500)		
                .style("opacity", 0);	
        })
        .on("click", function(d){
            const id = d.data.id;
            db.collection('expenses').doc(id).delete();
        });

}

let data = [];

db.collection('expenses').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = { ...change.doc.data(), id: change.doc.id };
        switch(change.type){
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                    data = data.filter(item => item.id != doc.id);
                    break;
            default: break;
        }
    })
    update(data);
})


function handlMouseClick(data){
    console.log("data");
}


const arcTweenEnter = (data) => {

    const i = d3.interpolate(data.startAngle,data.endAngle);

    return function(t){
        data.endAngle = i(t);
        return arcGenerator(data);
    }
}

const arcTweenExit = (data) => {

    const i = d3.interpolate(data.endAngle,data.startAngle);

    return function(t){
        data.endAngle = i(t);
        return arcGenerator(data);
    }
};

function arcTweenUpdate(data) {
    var i = d3.interpolate(this._current,data);

    this._current = data;

    return function(t){
        return arcGenerator(i(t));
    }
}