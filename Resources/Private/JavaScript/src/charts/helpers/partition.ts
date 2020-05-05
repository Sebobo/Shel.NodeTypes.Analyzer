import * as d3 from 'd3';

export default function partition(data, radius) {
    return d3.partition().size([2 * Math.PI, radius])(
        d3
            .hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value)
    );
}
