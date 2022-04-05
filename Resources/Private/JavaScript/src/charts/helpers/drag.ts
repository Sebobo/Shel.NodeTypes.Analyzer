import * as d3 from 'd3';

const drag = (
    simulation: d3.Simulation<d3.HierarchyCircularNode<unknown>, undefined>
): d3.DragBehavior<Element, unknown, unknown> => {
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
};

export default drag;
