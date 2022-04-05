import * as d3 from 'd3';
import { rollup, group } from 'd3-array';

import { DataSegment, Dependencies } from '../interfaces';
import { centroid, linkArc, drag, enableZoom } from './helpers';

interface DependencyChartProps {
    data: Dependencies;
    types: string[];
    width?: number;
    height?: number;
    markerSize?: number;
}

interface QuadTreeNode {
    data: { data: DataSegment; r: number; x: number; y: number };
    length: number;
    next: QuadTreeNode;
    x: number;
    y: number;
}

const forceCluster = () => {
    const strength = 0.2;
    let nodes;

    function force(alpha) {
        // @ts-ignore
        const centroids = rollup(nodes, centroid, (d: { data: DataSegment }) => d.data.group);
        const l = alpha * strength;
        for (const d of nodes) {
            const { x: cx, y: cy } = centroids.get(d.data.group);
            d.vx -= (d.x - cx) * l;
            d.vy -= (d.y - cy) * l;
        }
    }

    force.initialize = (_) => (nodes = _);

    return force;
};

const forceCollide = () => {
    const alpha = 0.4; // fixed for greater rigidity!
    const padding1 = 2; // separation between same-color nodes
    const padding2 = 6; // separation between different-color nodes
    let nodes;
    let maxRadius;

    function force() {
        const quadtree = d3.quadtree<QuadTreeNode>(
            nodes,
            (d) => d.x,
            (d) => d.y
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
                                d.x -= x *= l;
                                d.y -= y *= l;
                                q.data.x += x;
                                q.data.y += y;
                            }
                        }
                    } while ((q = q.next));
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        }
    }

    force.initialize = (_) =>
        (maxRadius =
            d3.max((nodes = _), (d: d3.HierarchyCircularNode<DataSegment>) => d.r) + Math.max(padding1, padding2));

    return force;
};

const pack = (width, height, data) =>
    d3.pack().size([width, height]).padding(1)(d3.hierarchy<DataSegment>(data).sum((d) => d.value));

const renderDependencyGraph = ({
    data,
    types,
    width = 975,
    height = 800,
    markerSize = 10,
}: DependencyChartProps): SVGSVGElement => {
    const links = data.links.map((d) => Object.create(d));
    const linkColor = d3.scaleOrdinal(d3.schemeCategory10);
    const nodeColor = d3.scaleOrdinal(d3.schemeCategory10);
    const groups = Object.keys(
        data.nodes.children.reduce((carry, node) => {
            carry[node.group] = true;
            return carry;
        }, {})
    );

    const treeData = {
        children: Array.from(
            group(data.nodes.children, (d) => d.group),
            ([, children]) => ({ children })
        ),
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
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('cluster', forceCluster())
        .force('collide', forceCollide());

    const svg = d3.create('svg').attr('viewBox', [0, 0, width, height].join(' ')).style('font', '14px "Noto Sans"');

    const loading = svg
        .append('text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .text('Simulating. One moment please…');

    d3.timeout(() => {
        // Precalculate ticks to reduce initial movement in graph
        for (
            let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
            i < n;
            ++i
        ) {
            simulation.tick();
        }

        loading.remove();

        svg.append('defs')
            .selectAll('marker')
            .data(types)
            .join('marker')
            .attr('id', (d) => `arrow-${d}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 15)
            .attr('refY', -0.5)
            .attr('markerWidth', markerSize)
            .attr('markerHeight', markerSize)
            .attr('orient', 'auto')
            .append('path')
            .attr('fill', linkColor)
            .attr('d', 'M0,-5L10,0L0,5');

        const g = svg.append('g');

        const hull = g
            .append('g')
            .selectAll('path')
            .data(groups)
            .join('path')
            .attr('fill', (d) => nodeColor(d))
            .attr('stroke', (d) => nodeColor(d))
            .attr('class', 'hull')
            .attr('id', (d) => `hull-${d}`);

        const link = g
            .append('g')
            .attr('fill', 'none')
            .attr('stroke-width', 1.5)
            .selectAll('path')
            .data(links)
            .join('path')
            .attr('stroke', (d) => nodeColor(d.group))
            .attr('marker-end', (d) => `url(${new URL(`#arrow-${d.type}`, location.toString())})`);

        const node = g
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
            node.attr('transform', (d) => `translate(${d.x},${d.y})`);
            hull.datum((d, i, g) => {
                const groupName = g[i]['id'].replace('hull-', '');
                const points: [number, number][] = simulation
                    .nodes()
                    .filter(({ data }) => data['group'] === groupName)
                    .map(({ x, y }) => [x, y]);
                return d3.polygonHull(points);
            }).attr('d', (d) => (d ? 'M' + d.join('L') + 'Z' : ''));
        });

        enableZoom({ svg, layer: g, width, height });
    });

    return svg.node();
};

export default renderDependencyGraph;
