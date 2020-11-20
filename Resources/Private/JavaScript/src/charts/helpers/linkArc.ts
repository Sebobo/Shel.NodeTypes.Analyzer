interface LinkArcParams {
    target: { x: number; y: number };
    source: { x: number; y: number };
}

const linkArc = (d: LinkArcParams): string => {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
    return `
    M${d.source.x},${d.source.y}
    A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
  `;
};

export default linkArc;
