const centroid = (nodes: { r: number; x: number; y: number }[]): { x: number; y: number } => {
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
};
export default centroid;
