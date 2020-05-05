export default function autoBox() {
    document.body.appendChild(this);
    const { x, y, width, height } = this.getBBox();
    document.body.removeChild(this);
    return [x, y, width, height];
}
