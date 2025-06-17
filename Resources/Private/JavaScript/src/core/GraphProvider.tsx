import React, { createContext, Dispatch, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import memoize from 'lodash.memoize';

import fetchData from '../helpers/fetchData';
import nodePathHelper from '../helpers/nodePathHelper';
import { useNotify } from './Notify';
import { chartType } from '../constants';
import { AppAction, AppState, useAppState } from './index';
import {
    appInitializationState,
    contentDimensionsConfigurationState,
    contentDimensionsFilterState,
    invalidNodeTypesState,
    loadingState,
    nodesState,
    nodeTypesState,
    workspaceFilterState,
    workspacesState,
} from '../state';

export interface GraphProviderProps {
    children: React.ReactElement;
    endpoints: Actions;
}

interface GraphProviderValues extends AppState {
    endpoints: Actions;
    dependencyData: Dependencies;
    fetchGraphData: () => Promise<void>;
    fetchNodes: (path?: string) => Promise<CRNodeList>;
    dispatch: Dispatch<AppAction>;
    getNodeTypeUsageLinks: (nodeTypeName: NodeTypeName) => Promise<void | NodeTypeUsageLink[]>;
}

export const GraphContext = createContext({} as GraphProviderValues);
export const useGraph = (): GraphProviderValues => useContext(GraphContext);

const GraphProvider = ({ children, endpoints }: GraphProviderProps): ReactElement => {
    const Notify = useNotify();
    const [appState, dispatch] = useAppState();

    const setIsLoading = useSetRecoilState(loadingState);
    const [nodeTypes, setNodeTypes] = useRecoilState(nodeTypesState);
    const setNodes = useSetRecoilState(nodesState);
    const setInvalidNodeTypes = useSetRecoilState(invalidNodeTypesState);
    const setAppInitializationState = useSetRecoilState(appInitializationState);
    const setWorkspaces = useSetRecoilState(workspacesState);
    const setContentDimensionsConfiguration = useSetRecoilState(contentDimensionsConfigurationState);

    const { selectedNodeTypeName, selectedPath, selectedLayout } = appState;

    // Data structure for rendering graphical charts
    // TODO: Use same structure for tree and charts
    const [dependencyData, setDependencyData] = useState({ nodes: { children: [] }, links: [] } as Dependencies);

    /**
     * Retrieves a link list of the usages of one nodetype
     */
    const getNodeTypeUsageLinks = memoize(async (nodeTypeName: string): Promise<void | NodeTypeUsageLink[]> => {
        try {
            try {
                const { usageLinks } = await fetchData(endpoints.getNodeTypeUsage, { nodeTypeName }, 'GET');
                return usageLinks;
            } catch (error) {
                return Notify.error(error);
            }
        } finally {
            setIsLoading(false);
        }
    });

    const fetchGraphData = useCallback(async (): Promise<void> => {
        try {
            try {
                const { nodeTypes } = await fetchData<NodeTypeConfigurations>(
                    endpoints.getNodeTypeDefinitions,
                    null,
                    'GET'
                );
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
            } catch (error) {
                return Notify.error(error);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchNodes = useRecoilCallback(
        ({ snapshot }) =>
            async (path?: string): Promise<CRNodeList> => {
                const workspaceFilter = await snapshot.getPromise(workspaceFilterState);
                const contentDimensionsFilter = await snapshot.getPromise(contentDimensionsFilterState);
                try {
                    const {
                        nodes: newNodes,
                        workspaces,
                        contentDimensionsConfiguration,
                    } = await fetchData<{
                        nodes: CRNodeList;
                        workspaces: Workspace[];
                        contentDimensionsConfiguration: ContentDimensionsConfiguration;
                    }>(
                        endpoints.getNodes,
                        {
                            path: path ?? '',
                            workspace: workspaceFilter,
                            dimensionValues: JSON.stringify(contentDimensionsFilter),
                        },
                        'GET'
                    );
                    setNodes((storedNodes) => {
                        return {
                            ...storedNodes,
                            ...newNodes,
                        };
                    });
                    if (Array.isArray(workspaces) && workspaces.length > 0) {
                        setWorkspaces(workspaces);
                    }
                    if (
                        typeof contentDimensionsConfiguration === 'object' &&
                        Object.keys(contentDimensionsConfiguration).length > 0
                    ) {
                        setContentDimensionsConfiguration(contentDimensionsConfiguration);
                    }
                    return newNodes;
                } catch (error) {
                    Notify.error(error);
                }
            },
        []
    );

    /**
     * Runs initial request to fetch all nodetype definitions
     */
    useEffect(() => {
        Promise.all([fetchGraphData(), fetchNodes()]).then(() => setAppInitializationState(true));
    }, []);

    /**
     * Converts node types list into a structure for dependency graphs
     */
    useEffect(() => {
        if (Object.keys(nodeTypes).length === 0 || selectedLayout !== chartType.DEPENDENCIES) return;

        let types = {};

        if (selectedNodeTypeName) {
            const { superTypes } = nodeTypes[selectedNodeTypeName];
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

            if (superTypes) {
                Object.keys(superTypes).forEach((superType) => {
                    if (superTypes[superType]) {
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

    return (
        <GraphContext.Provider
            value={{
                endpoints,
                dependencyData,
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
