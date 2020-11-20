import * as d3 from 'd3';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const partition = (data: any, radius: number) =>
    d3.partition().size([2 * Math.PI, radius])(
        d3
            .hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value)
    );

export default partition;
