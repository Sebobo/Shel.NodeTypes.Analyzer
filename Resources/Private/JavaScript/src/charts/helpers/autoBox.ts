const autoBox = (node: SVGGraphicsElement): number[] => {
    document.body.appendChild(<Node>node);
    const { x, y, width, height } = node.getBBox();
    document.body.removeChild(<Node>node);
    return [x, y, width, height];
};

export default autoBox;
