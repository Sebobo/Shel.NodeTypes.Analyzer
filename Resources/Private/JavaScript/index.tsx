
import '../Styles/styles.scss';

interface NodeTypeGroup {
    name: string;
    color: string;
}

window.onload = function () {
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

    const clusters = graphSvgWrapper.querySelectorAll('g.cluster');
    const nodes = graphSvgWrapper.querySelectorAll('g.node');

    nodes.forEach(node => {
        node.addEventListener('click', () => {
            const selectedNodeType = node.querySelector('title').textContent;
            console.log('Clicked', selectedNodeType);
            nodeTypesFormBaseNodeTypeField.value = selectedNodeType;
            nodeTypesForm.submit();
        });
    });
};
