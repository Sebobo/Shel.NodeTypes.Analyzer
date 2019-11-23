import * as React from 'react';
import { createUseStyles } from 'react-jss';
import { useGraph } from '../providers/GraphProvider';
import { useEffect, useRef, useState } from 'react';
import fetchData from '../helpers/fetchData';
import NodeTypeGroup from '../interfaces/NodeTypeGroup';
import svgPanZoom from 'svg-pan-zoom';
import NodeTypeConfiguration from '../interfaces/NodeTypeConfiguration';
import NodeTypeProfile from './NodeTypeProfile';
import dotProp from 'dot-prop';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import searchForKeys from 'keys-in-object';

const useStyles = createUseStyles({
    graphToolbar: {
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        '> *': {
            flex: 1,
        },
    },
    graphForm: {
        '.neos &': {
            '& select': {
                width: '100%',
            },
        },
    },
    buttons: {
        '.neos &': {
            display: 'flex',
            flexWrap: 'wrap',
            margin: '0 -.5rem',
            '& > .neos-button': {
                margin: '0 .5rem',
                flex: 1,
            },
        },
    },
    nodeTypesGraph: {
        '.neos &': {
            marginLeft: '2rem',
            backgroundColor: 'gray',
            border: '1px solid lightgray',
        },
        '& object': {
            display: 'none',
        },
        '& svg': {
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            '& g': {
                '&.node': {
                    cursor: 'pointer',
                    '&:hover': {
                        '& polygon, & ellipse': {
                            fill: '#00b3ee',
                        },
                        '& text': {
                            fill: '#fff',
                        },
                    },
                },
            },
        },
    },
    nodeMatchesFilter: {
        '& polygon, & ellipse': {
            strokeWidth: '5px',
        },
    },
    nodeDoesNotMatchFilter: {
        opacity: '.5',
    },
});

export default function GraphApp() {
    const classes = useStyles({});
    const [graphContext] = useGraph();
    const { translate, selectableLayouts, actions, csrfToken, notificationHelper, graphSvgWrapper } = graphContext;

    // State hooks
    const [selectedLayout, setSelectedLayout] = useState(Object.keys(selectableLayouts)[0]);
    const [selectedNodeTypeName, setSelectedNodeTypeName] = useState('');
    const [nodeTypes, setNodeTypes] = useState({} as { [index: string]: NodeTypeConfiguration });
    const [isSendingData, setIsSendingData] = useState(false);
    const [graphSvgData, setGraphSvgData] = useState('');
    const [nodeTypeGroups, setNodeTypeGroups] = useState({} as NodeTypeGroup[]);
    const [graphVersion, setGraphVersion] = useState(0);
    const [configurationPathFilter, setConfigurationPathFilter] = useState('');
    const [superTypeFilter, setSuperTypeFilter] = useState('');

    // Request new data
    const submitForm = (event?: React.FormEvent<HTMLFormElement>): void => {
        if (event) event.preventDefault();

        setIsSendingData(true);

        const data = {
            __csrfToken: csrfToken,
            moduleArguments: {
                layout: selectedLayout,
                baseNodeType: selectedNodeTypeName,
            },
        };

        fetchData(actions.renderGraphSvg, data)
            .then((data: any) => {
                const { svgData, nodeTypeGroups } = data;
                setNodeTypeGroups(nodeTypeGroups);
                setGraphSvgData(svgData);
            })
            .catch(notificationHelper.error)
            .finally(() => setIsSendingData(false));
    };

    // Input references
    const configurationPathFilterRef = useRef(null);
    const superTypeFilterRef = useRef(null);

    // Graph interactions
    const selectNodeTypeInGraph = (e: MouseEvent): void => {
        const graphNode = e.target as HTMLElement;
        const nodeTypeName = graphNode.closest('g').querySelector('title').textContent;
        setSelectedNodeTypeName(nodeTypeName);
    };

    // Effects

    /**
     * Reload the graph when a node is selected
     */
    useEffect(() => {
        submitForm();
    }, [selectedNodeTypeName]);

    /**
     * Runs initial request to fetch all nodetype definitions
     */
    useEffect(() => {
        fetchData(actions.getNodeTypeDefinitions, null, 'GET')
            .then((data: any) => {
                const { nodeTypes } = data;
                setNodeTypes(nodeTypes);
            })
            .catch(notificationHelper.error);
    }, []);

    /**
     * Update the rendered SVG graph when a filter is enabled
     */
    useEffect(() => {
        const escapedSuperTypeFilter = superTypeFilter.replace('.', '\\.');
        const filteredNodeTypes =
            configurationPathFilter || superTypeFilter
                ? Object.keys(nodeTypes).filter(nodeTypeName => {
                      const nodeType = nodeTypes[nodeTypeName];
                      if (!nodeType || nodeType instanceof Array || !(nodeType instanceof Object)) return false;
                      if (superTypeFilter && dotProp.get(nodeType, `superTypes.${escapedSuperTypeFilter}`) !== true)
                          return false;
                      return (
                          dotProp.has(nodeType, configurationPathFilter) ||
                          searchForKeys(nodeType, configurationPathFilter).filter((key: any) => key !== undefined)
                              .length > 0
                      );
                  })
                : [];

        const nodes = graphSvgWrapper.querySelectorAll('g.node');
        nodes.forEach(node => {
            if (!configurationPathFilter && !superTypeFilter) {
                node.classList.remove(classes.nodeMatchesFilter, classes.nodeDoesNotMatchFilter);
            } else if (filteredNodeTypes.indexOf(node.querySelector('title').textContent) >= 0) {
                node.classList.add(classes.nodeMatchesFilter);
                node.classList.remove(classes.nodeDoesNotMatchFilter);
            } else {
                node.classList.add(classes.nodeDoesNotMatchFilter);
                node.classList.remove(classes.nodeMatchesFilter);
            }
        });
    }, [configurationPathFilter, superTypeFilter, graphVersion]);

    /**
     * Injects the SVG and handles event listeners
     */
    useEffect(() => {
        if (!graphSvgData) {
            return;
        }
        graphSvgWrapper.className = classes.nodeTypesGraph;
        graphSvgWrapper.innerHTML = graphSvgData.trim();

        const graphSvg = graphSvgWrapper.querySelector('svg');
        // const clusters = graphSvg.querySelectorAll('g.cluster');
        const nodes = graphSvg.querySelectorAll('g.node');
        nodes.forEach(node => node.addEventListener('click', selectNodeTypeInGraph));

        // Init svg pan and zoom functionality
        const panZoom = svgPanZoom(graphSvg, {});

        setGraphVersion(graphVersion + 1);

        return () => {
            nodes.forEach(node => node.removeEventListener('click', selectNodeTypeInGraph));
            panZoom.destroy();
        };
    }, [graphSvgData]);

    return (
        <div className={classes.graphToolbar}>
            <form onSubmit={e => submitForm(e)} className={classes.graphForm}>
                <div className="row">
                    <div className="neos-control-group">
                        <label htmlFor="layout" className="neos-control-label">
                            {translate('field.layout.label', 'Layout')}
                        </label>
                        <select name="layout" id="layout" onChange={e => setSelectedLayout(e.target.value)}>
                            {Object.keys(selectableLayouts).map(layout => (
                                <option value={layout} key={layout}>
                                    {selectableLayouts[layout]} ({layout})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="neos-control-group">
                        <div className={classes.buttons}>
                            <button type="submit" disabled={isSendingData} className="neos-button neos-button-primary">
                                <i className="fa fa-paint-brush" /> {translate('action.renderGraph', 'Render graph')}
                            </button>
                            <button
                                type="reset"
                                disabled={isSendingData}
                                className="neos-button"
                                onClick={() => {
                                    setSelectedNodeTypeName('');
                                }}
                            >
                                <i className="fa fa-recycle" /> {translate('action.resetGraph', 'Reset graph')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <div className="row">
                <div className="neos-control-group">
                    <label htmlFor="configurationPathFilter" className="neos-control-label">
                        {translate('field.configurationPath.label', 'Filter configuration path')}
                    </label>
                    <input
                        id="configurationPathFilter"
                        name="configurationPathFilter"
                        type="text"
                        ref={configurationPathFilterRef}
                    />
                    <label htmlFor="superTypeFilter" className="neos-control-label">
                        {translate('field.superType.label', 'Filter by supertype')}
                    </label>
                    <select
                        id="superTypeFilter"
                        name="superTypeFilter"
                        ref={superTypeFilterRef}
                        onChange={e => setSuperTypeFilter(e.target.value)}
                    >
                        <option value="">Select a parent nodetype</option>
                        {Object.keys(nodeTypes).map(nodeTypeName => (
                            <option key={nodeTypeName}>{nodeTypeName}</option>
                        ))}
                    </select>
                </div>
                <div className="neos-control-group">
                    <div className={classes.buttons}>
                        <button
                            disabled={isSendingData}
                            className="neos-button neos-button-success"
                            onClick={() => setConfigurationPathFilter(configurationPathFilterRef.current.value)}
                        >
                            <i className="fa fa-search" /> {translate('action.filterGraph', 'Filter graph')}
                        </button>
                    </div>
                </div>
            </div>
            {selectedNodeTypeName && (
                <NodeTypeProfile
                    nodeTypeName={selectedNodeTypeName}
                    nodeTypeConfiguration={nodeTypes[selectedNodeTypeName]}
                />
            )}
        </div>
    );
}
