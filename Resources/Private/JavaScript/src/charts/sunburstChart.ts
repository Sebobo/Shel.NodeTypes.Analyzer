import * as d3 from 'd3';
import { DefaultArcObject } from 'd3';

import { DataSegment } from '../interfaces';
import { partition, autoBox, enableZoom } from './helpers';

interface SunburstProps {
    data: DataSegment;
    width?: number;
    height?: number;
}

export interface ExtendedArcObject extends DefaultArcObject {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

export default function renderSunburstChart({ data, width = 975, height = 800 }: SunburstProps) {
    const radius = Math.max(500, width / 2);
    const root = partition(data, radius);
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children?.length + 1));

    const arc = d3
        .arc()
        .startAngle((d: ExtendedArcObject) => d.x0)
        .endAngle((d: ExtendedArcObject) => d.x1)
        .padAngle((d: ExtendedArcObject) => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius / 2)
        .innerRadius((d: ExtendedArcObject) => d.y0)
        .outerRadius((d: ExtendedArcObject) => d.y1 - 1);

    const svg = d3.create('svg');

    const g = svg.append('g');

    g.append('g')
        .attr('fill-opacity', 0.6)
        .selectAll('path')
        .data(root.descendants().filter(d => d.depth))
        .join('path')
        .attr('fill', d => {
            while (d.depth > 1) d = d.parent;
            // @ts-ignore
            return color(d.data.name);
        })
        .attr('d', (arc as unknown) as string)
        .attr('class', 'segment')
        .append('title')
        .text(
            d =>
                `${d
                    .ancestors()
                    .map(d => {
                        // @ts-ignore
                        return d.data.name;
                    })
                    .reverse()
                    .join('/')}`
        );

    g.append('g')
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('font-family', 'Noto Sans')
        .selectAll('text')
        .data(root.descendants().filter(d => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10))
        .join('text')
        .attr('transform', function(d) {
            const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
            const y = (d.y0 + d.y1) / 2;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr('dy', '0.35em')
        .attr('class', 'node')
        .attr('path', d => {
            // @ts-ignore
            return d.data.path;
        })
        .text(d => {
            // @ts-ignore
            return d.data.name;
        });

    // @ts-ignore
    svg.attr('viewBox', autoBox);
    svg.attr('height', height);

    enableZoom({ svg, layer: g, width, height });

    return svg.node();
}
