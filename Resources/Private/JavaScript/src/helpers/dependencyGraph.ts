import * as d3 from 'd3';
import { SimulationNodeDatum } from 'd3';

import { DataSegment, Dependencies } from '../interfaces';

interface DependencyChartProps {
    data: Dependencies;
    types: string[];
    width?: number;
    height?: number;
}

function linkArc(d) {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
}

const drag = simulation => {
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

    return d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
};

export interface ExtendedNodeDatum extends SimulationNodeDatum, DataSegment {}

export default function renderDependencyGraph({ data, types, width = 975, height = 800 }: DependencyChartProps) {
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));
    const linkColor = d3.scaleOrdinal(d3.schemeCategory10);
    const nodeColor = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3
        .forceSimulation(nodes)
        .force(
            'link',
            d3.forceLink(links).id((d: ExtendedNodeDatum) => d.name)
        )
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('x', d3.forceX())
        .force('y', d3.forceY());

    const svg = d3
        .create('svg')
        .attr('viewBox', [-width / 2, -height / 2, width, height].join(' '))
        .style('font', '12px sans-serif');

    // Per-type markers, as they don't inherit styles.
    svg.append('defs')
        .selectAll('marker')
        .data(types)
        .join('marker')
        .attr('id', d => `arrow-${d}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', -0.5)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('fill', linkColor)
        .attr('d', 'M0,-5L10,0L0,5');

    const link = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('stroke', d => linkColor(d.type))
        .attr('marker-end', d => `url(${new URL(`#arrow-${d.type}`, location.toString())})`);

    const node = svg
        .append('g')
        .attr('fill', 'currentColor')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .call(drag(simulation));

    node.append('circle')
        .attr('stroke', d => nodeColor(d.group))
        .attr('stroke-width', 1.5)
        .attr('r', d => 4 * d.value);

    node.append('text')
        .attr('x', d => 4 + 4 * d.value)
        .attr('y', '0.31em')
        .attr('fill', 'white')
        .attr('class', 'node')
        .attr('path', d => d.path)
        .text(d => d.name);

    simulation.on('tick', () => {
        link.attr('d', linkArc);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // invalidation.then(() => simulation.stop());

    return svg.node();
}
