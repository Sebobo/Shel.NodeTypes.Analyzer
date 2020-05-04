import * as d3 from 'd3';
import { rollup, group } from 'd3-array';

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

function centroid(nodes) {
    let x = 0;
    let y = 0;
    let z = 0;
    for (const d of nodes) {
        const k = d.r ** 2;
        x += d.x * k;
        y += d.y * k;
        z += k;
    }
    return { x: x / z, y: y / z };
}

const forceCluster = () => {
    const strength = 0.2;
    let nodes;

    function force(alpha) {
        const centroids = rollup(nodes, centroid, (d: { data: DataSegment }) => d.data.group);
        const l = alpha * strength;
        for (const d of nodes) {
            const { x: cx, y: cy } = centroids.get(d.data.group);
            d.vx -= (d.x - cx) * l;
            d.vy -= (d.y - cy) * l;
        }
    }

    force.initialize = _ => (nodes = _);

    return force;
};

interface QuadTreeNode {
    data: { data: DataSegment; r: number; x: number; y: number };
    length: number;
    next: QuadTreeNode;
    x: number;
    y: number;
}

const forceCollide = () => {
    const alpha = 0.4; // fixed for greater rigidity!
    const padding1 = 2; // separation between same-color nodes
    const padding2 = 6; // separation between different-color nodes
    let nodes;
    let maxRadius;

    function force() {
        const quadtree = d3.quadtree<QuadTreeNode>(
            nodes,
            d => d.x,
            d => d.y
        );
        for (const d of nodes) {
            const r = d.r + maxRadius;
            const nx1 = d.x - r,
                ny1 = d.y - r;
            const nx2 = d.x + r,
                ny2 = d.y + r;

            // @ts-ignore
            quadtree.visit((q: QuadTreeNode, x1, y1, x2, y2) => {
                if (!q.length) {
                    do {
                        if (q.data !== d) {
                            const r = d.r + q.data.r + (d.data.group === q.data.data.group ? padding1 : padding2);
                            let x = d.x - q.data.x,
                                y = d.y - q.data.y,
                                l = Math.hypot(x, y);
                            if (l < r) {
                                l = ((l - r) / l) * alpha;
                                (d.x -= x *= l), (d.y -= y *= l);
                                (q.data.x += x), (q.data.y += y);
                            }
                        }
                    } while ((q = q.next));
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        }
    }

    force.initialize = _ =>
        (maxRadius =
            d3.max((nodes = _), (d: d3.HierarchyCircularNode<DataSegment>) => d.r) + Math.max(padding1, padding2));

    return force;
};

const pack = (width, height, data) =>
    d3
        .pack()
        .size([width, height])
        .padding(1)(d3.hierarchy<DataSegment>(data).sum(d => d.value));

export default function renderDependencyGraph({ data, types, width = 975, height = 800 }: DependencyChartProps) {
    const links = data.links.map(d => Object.create(d));
    const linkColor = d3.scaleOrdinal(d3.schemeCategory10);
    const nodeColor = d3.scaleOrdinal(d3.schemeCategory10);

    const treeData = {
        children: Array.from(
            group(data.nodes.children, d => d.group),
            ([, children]) => ({ children })
        )
    };

    const nodes = pack(width, height, treeData).leaves();

    const simulation = d3
        .forceSimulation(nodes)
        .force(
            'link',
            d3.forceLink(links).id((d: d3.HierarchyCircularNode<DataSegment>) => d.data.name)
        )
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .force('cluster', forceCluster())
        .force('collide', forceCollide());

    const svg = d3
        .create('svg')
        .attr('viewBox', [-width / 2, -height / 2, width, height].join(' '))
        .style('font', '14px "Noto Sans"');

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
        .join('g');
    // @ts-ignore
    node.call(drag(simulation));

    node.append('circle')
        .attr('stroke', (d: d3.HierarchyCircularNode<DataSegment>) => nodeColor(d.data.group))
        .attr('stroke-width', 1.5)
        .attr('r', (d: d3.HierarchyCircularNode<DataSegment>) => 4 * d.data.value);

    node.append('text')
        .attr('x', (d: d3.HierarchyCircularNode<DataSegment>) => 4 + 4 * d.data.value)
        .attr('y', '0.31em')
        .attr('fill', 'white')
        .attr('class', 'node')
        .attr('path', (d: d3.HierarchyCircularNode<DataSegment>) => d.data.path)
        .text((d: d3.HierarchyCircularNode<DataSegment>) => d.data.name);

    simulation.on('tick', () => {
        link.attr('d', linkArc);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // invalidation.then(() => simulation.stop());

    return svg.node();
}
