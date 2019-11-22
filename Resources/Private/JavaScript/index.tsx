
import '../Styles/styles.scss';

import svgPanZoom from 'svg-pan-zoom';

interface NodeTypeGroup {
    name: string;
    color: string;
}

window.addEventListener('load', () => {
    const nodeTypesGraphContainer: HTMLElement = document.querySelector('.nodetypes-graph');
    const nodeTypesForm = nodeTypesGraphContainer.querySelector('form');
    const nodeTypesFormBaseNodeTypeField: HTMLSelectElement = nodeTypesForm.querySelector('select[name="moduleArguments[baseNodeType]"');
    const nodeTypesGraph = nodeTypesGraphContainer.querySelector('object');
    const nodeTypeGroups: { [index: number]: NodeTypeGroup } = JSON.parse(nodeTypesGraphContainer.dataset.nodetypeGroups);

    let graphSvgSource = window.atob(document.querySelector('object').getAttribute('data').replace(/^.*;base64,/, ''));
    const graphSvgWrapper = document.createElement('div');

    Object.keys(nodeTypeGroups).forEach(nodeTypeGroup => {
        graphSvgSource = graphSvgSource.replace(nodeTypeGroup, nodeTypeGroups[nodeTypeGroup as unknown as number].name);
    });
    graphSvgWrapper.innerHTML = graphSvgSource.trim();

    nodeTypesGraph.after(graphSvgWrapper);
    nodeTypesGraph.remove();

    const graphSvg = graphSvgWrapper.querySelector('svg');
    const clusters = graphSvg.querySelectorAll('g.cluster');
    const nodes = graphSvg.querySelectorAll('g.node');

    nodes.forEach(node => {
        node.addEventListener('click', () => {
            const selectedNodeType = node.querySelector('title').textContent;
            console.debug('Clicked', selectedNodeType);
            nodeTypesFormBaseNodeTypeField.value = selectedNodeType;
            nodeTypesForm.submit();
        });
    });

    // Init svg pan and zoom functionality
    svgPanZoom(graphSvg, {});
});
