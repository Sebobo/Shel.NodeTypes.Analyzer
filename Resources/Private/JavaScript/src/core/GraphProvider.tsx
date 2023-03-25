import * as React from 'react';
import { createContext, ReactElement, useCallback, useContext, useEffect, useState, Dispatch } from 'react';
import { $set } from 'plow-js';
import { useRecoilValue } from 'recoil';
import memoize from 'lodash.memoize';

import fetchData from '../helpers/fetchData';
import nodePathHelper from '../helpers/nodePathHelper';
import { useNotify } from './Notify';
import { chartType, FilterType } from '../constants';
import { useAppState, AppAction, AppState } from './index';
import { filterTypeState } from '../atoms';

export interface GraphProviderProps {
    children: React.ReactElement;
    endpoints: Actions;
}

interface GraphProviderValues extends AppState {
    endpoints: Actions;
    isLoading: boolean;
    nodeTypeGroups: NodeTypeGroup[];
    setNodeTypeGroups: (nodeTypeGroups: NodeTypeGroup[]) => void;
    nodeTypes: NodeTypeConfigurations;
    setNodeTypes: (nodeTypes: NodeTypeConfigurations) => void;
    superTypeFilter: string;
    setSuperTypeFilter: (filter: string) => void;
    graphData: DataSegment;
    dependencyData: Dependencies;
    treeData: TreeDataPoint;
    nodes: CRNodeList;
    invalidNodeTypes: NodeTypeConfigurations;
    setInvalidNodeTypes: (nodeTypes: NodeTypeConfigurations) => void;
    fetchGraphData: () => Promise<void>;
    fetchNodes: (path: string) => Promise<CRNodeList>;
    dispatch: Dispatch<AppAction>;
    getNodeTypeUsageLinks: (nodeTypeName: NodeTypeName) => Promise<void | NodeTypeUsageLink[]>;
}

export const GraphContext = createContext({} as GraphProviderValues);
export const useGraph = (): GraphProviderValues => useContext(GraphContext);

const GraphProvider = ({ children, endpoints }: GraphProviderProps): ReactElement => {
    const Notify = useNotify();
    const [appState, dispatch] = useAppState();

    const [isLoading, setIsLoading] = useState(true);
    const [nodeTypeGroups, setNodeTypeGroups] = useState<NodeTypeGroup[]>([]);
    const [nodeTypes, setNodeTypes] = useState<NodeTypeConfigurations>({});
    const [nodes, setNodes] = useState<CRNodeList>({});
    const [invalidNodeTypes, setInvalidNodeTypes] = useState<NodeTypeConfigurations>({});
    const [superTypeFilter, setSuperTypeFilter] = useState('');
    const selectedFilter = useRecoilValue(filterTypeState);

    const { selectedNodeTypeName, selectedPath, selectedLayout } = appState;

    // Data structure for rendering the nodetype tree
    const [treeData, setTreeData] = useState({});
    // Data structure for rendering graphical charts
    // TODO: Use same structure for tree and charts
    const [graphData, setGraphData] = useState({} as DataSegment);
    const [dependencyData, setDependencyData] = useState({ nodes: { children: [] }, links: [] } as Dependencies);

    /**
     * Recursive function to convert tree data to chart data
     *
     * @param data
     * @param path
     */
    const processTreeData = (data, path = '') => {
        return Object.keys(data).map((segment) => {
            const currentData = data[segment];
            const segmentPath = path ? path + '.' + segment : segment;
            const node: DataSegment = { name: segment, path: segmentPath };
            if (currentData.nodeType) {
                node['value'] = 1;
                node['data'] = currentData;
            } else {
                node['children'] = processTreeData(currentData, segmentPath);
            }
            return node;
        });
    };

    /**
     * Retrieves a link list of the usages of one nodetype
     */
    const getNodeTypeUsageLinks = memoize((nodeTypeName: string): Promise<void | NodeTypeUsageLink[]> => {
        return fetchData(endpoints.getNodeTypeUsage, { nodeTypeName }, 'GET')
            .then(({ usageLinks }: { usageLinks: NodeTypeUsageLink[] }) => usageLinks)
            .catch((error) => Notify.error(error))
            .finally(() => setIsLoading(false));
    });

    const fetchGraphData = useCallback((): Promise<void> => {
        return fetchData<NodeTypeConfigurations>(endpoints.getNodeTypeDefinitions, null, 'GET')
            .then(({ nodeTypes }) => {
                // Separate nodetypes that have invalid names and cannot be rendered properly
                const { validNodeTypes, invalidNodeTypes } = Object.keys(nodeTypes).reduce(
                    (carry, nodeTypeName) => {
                        if (nodeTypeName.match(/^[\w]+([.:](?!\.).+)*$/gimu)) {
                            carry['validNodeTypes'][nodeTypeName] = nodeTypes[nodeTypeName];
                        } else {
                            carry['invalidNodeTypes'][nodeTypeName] = nodeTypes[nodeTypeName];
                        }
                        return carry;
                    },
                    {
                        validNodeTypes: {},
                        invalidNodeTypes: {},
                    }
                );

                setNodeTypes(validNodeTypes);
                setInvalidNodeTypes(invalidNodeTypes);
            })
            .catch((error) => Notify.error(error))
            .finally(() => setIsLoading(false));
    }, []);

    const fetchNodes = useCallback((path: string): Promise<CRNodeList> => {
        return fetchData(
            endpoints.getNodes,
            {
                path,
            },
            'GET'
        )
            .then(({ nodes: newNodes }) => {
                setNodes((storedNodes) => {
                    return {
                        ...storedNodes,
                        ...newNodes,
                    };
                });
                return newNodes;
            })
            .catch((error) => Notify.error(error));
    }, []);

    /**
     * Runs initial request to fetch all nodetype definitions
     */
    useEffect(() => {
        fetchGraphData();
        fetchNodes('/');
    }, []);

    /**
     * Converts flat nodetypes structure into tree
     */
    useEffect(() => {
        if (Object.keys(nodeTypes).length === 0) return;

        const treeData = Object.values(nodeTypes).reduce((carry: Record<string, { nodeType: string }>, nodeType) => {
            // TODO: Extract filter methods
            if (selectedFilter === FilterType.UNUSED_CONTENT || selectedFilter === FilterType.UNUSED_DOCUMENTS) {
                if (
                    nodeType.usageCount > 0 ||
                    nodeType.abstract ||
                    (nodeType.configuration.superTypes &&
                        Object.keys(nodeType.configuration.superTypes).indexOf(
                            `Neos.Neos:${selectedFilter === FilterType.UNUSED_CONTENT ? 'Content' : 'Document'}`
                        ) == -1)
                ) {
                    return carry;
                }
            }
            return $set(nodePathHelper.resolveFromType(nodeType), { nodeType: nodeType.name }, carry);
        }, {});

        setTreeData(treeData);
    }, [nodeTypes, selectedFilter]);

    /**
     * Converts nodetypes list into a structure for dependency graphs
     */
    useEffect(() => {
        if (Object.keys(nodeTypes).length === 0 || selectedLayout !== chartType.DEPENDENCIES) return;

        let types = {};

        if (selectedNodeTypeName) {
            const selectedNodeType = nodeTypes[selectedNodeTypeName];
            const typesToAdd = [selectedNodeTypeName];

            while (typesToAdd.length > 0) {
                const typeToAdd = nodeTypes[typesToAdd.pop()];
                const superTypes = typeToAdd.declaredSuperTypes;
                if (superTypes) {
                    superTypes.forEach((superType) => {
                        if (superTypes[superType] && Object.keys(types).indexOf(superType) === -1) {
                            typesToAdd.push(superType);
                        }
                    });
                }
                types[typeToAdd.name] = typeToAdd;
            }

            if (selectedNodeType.configuration.superTypes) {
                Object.keys(selectedNodeType.configuration.superTypes).forEach((superType) => {
                    if (selectedNodeType.configuration.superTypes[superType]) {
                        types[superType] = nodeTypes[superType];
                    }
                });
            }
        } else {
            types = nodeTypes;
        }

        const typeNames = Object.keys(types);
        const includedTypes = [];
        const linkedTypes = {};

        const data = Object.values(types).reduce<Dependencies>(
            (carry, nodeType: NodeTypeConfiguration) => {
                const nodeTypePath = nodePathHelper.resolveFromType(nodeType);
                if (selectedPath && nodeTypePath.indexOf(selectedPath) !== 0) {
                    return carry;
                }

                carry.nodes.children.push({
                    name: nodeType.name,
                    group: nodePathHelper.resolveGroup(nodeType.name),
                    path: nodeTypePath,
                    value: selectedNodeTypeName === nodeType.name ? 2 : 1,
                });
                includedTypes.push(nodeType.name);

                if (nodeType.declaredSuperTypes) {
                    nodeType.declaredSuperTypes.forEach((superType) => {
                        if (typeNames.includes(superType)) {
                            carry.links.push({
                                source: nodeType.name,
                                target: superType,
                                type: 'inherits',
                                group: nodePathHelper.resolveGroup(superType),
                            });
                            linkedTypes[superType] = true;
                        }
                        // TODO: Show warning when a link cannot be generated due to a missing (unfiltered) type
                    });
                }
                return carry;
            },
            {
                nodes: {
                    children: [],
                },
                links: [],
            } as Dependencies
        );

        // Add missing nodes that are being linked but not included via the current path
        if (selectedPath) {
            Object.keys(linkedTypes)
                .filter((type) => !includedTypes.includes(type))
                .forEach((linkedType) => {
                    data.nodes.children.push({
                        name: linkedType,
                        group: nodePathHelper.resolveGroup(linkedType),
                        path: nodePathHelper.resolveFromName(linkedType),
                        value: 1,
                    });
                });
        }

        setDependencyData(data);
    }, [nodeTypes, selectedPath, selectedNodeTypeName, selectedLayout]);

    /**
     * Converts tree based nodetypes structure into a form that can be used for graphical charts
     */
    useEffect(() => {
        if (Object.keys(treeData).length === 0) return;
        setGraphData({ name: 'nodetypes', path: '', children: processTreeData(treeData) });
    }, [treeData]);

    return (
        <GraphContext.Provider
            value={{
                endpoints,
                isLoading,
                nodeTypeGroups,
                setNodeTypeGroups,
                nodeTypes,
                setNodeTypes,
                superTypeFilter,
                setSuperTypeFilter,
                graphData,
                dependencyData,
                treeData,
                nodes,
                invalidNodeTypes,
                setInvalidNodeTypes,
                getNodeTypeUsageLinks,
                fetchGraphData,
                fetchNodes,
                ...appState,
                dispatch,
            }}
        >
            {children}
        </GraphContext.Provider>
    );
};

export default GraphProvider;
