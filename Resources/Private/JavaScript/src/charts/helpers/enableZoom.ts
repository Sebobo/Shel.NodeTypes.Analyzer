import * as d3 from 'd3';

interface EnableZoomProps {
    svg: d3.Selection<SVGGElement, undefined, null, undefined>;
    layer: d3.Selection<SVGGElement, undefined, null, undefined>;
    width: number;
    height: number;
    minExtend?: number;
    maxExtend?: number;
}

const enableZoom = ({ svg, layer, width, height, minExtend = 0.25, maxExtend = 3 }: EnableZoomProps): void => {
    function zoomed() {
        layer.attr('transform', d3.event.transform);
    }

    svg.call(
        d3
            .zoom()
            .extent([
                [0, 0],
                [width, height],
            ])
            .scaleExtent([minExtend, maxExtend])
            .on('zoom', zoomed)
    );
};

export default enableZoom;
