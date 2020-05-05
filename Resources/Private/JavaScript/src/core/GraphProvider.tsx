import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { $set } from 'plow-js';

import { Actions, DataSegment, Dependencies, NodeTypeConfiguration, NodeTypeGroup } from '../interfaces';
import fetchData from '../helpers/fetchData';
import { useNotify } from './Notify';
import { LinkType } from '../interfaces/Dependencies';
import { chartType, FilterType } from '../constants';

export interface GraphProviderProps {
    children: React.ReactElement;
    actions: Actions;
}

interface GraphProviderValues {
    actions: Actions;
    isLoading: boolean;
    selectedNodeTypeName: string;
    setSelectedNodeTypeName: (selectedNodeTypeName: string) => void;
    selectedLayout: chartType;
    setSelectedLayout: (layout: chartType) => void;
    nodeTypeGroups: NodeTypeGroup[];
    setNodeTypeGroups: (nodeTypeGroups: NodeTypeGroup[]) => void;
    nodeTypes: NodeTypeConfigurations;
    setNodeTypes: (nodeTypes: NodeTypeConfigurations) => void;
    superTypeFilter: string;
    setSuperTypeFilter: (filter: string) => void;
    selectedPath: string;
    setSelectedPath: (path: string) => void;
    graphData: DataSegment;
    dependencyData: Dependencies;
    treeData: object;
    selectedFilter: string;
    setSelectedFilter: (filter: FilterType) => void;
    invalidNodeTypes: NodeTypeConfigurations;
    setInvalidNodeTypes: (nodeTypes: NodeTypeConfigurations) => void;
}

interface NodeTypeConfigurations {
    [index: string]: NodeTypeConfiguration;
}

export const GraphContext = createContext({} as GraphProviderValues);
export const useGraph = () => useContext(GraphContext);

export default function GraphProvider({ children, actions }: GraphProviderProps) {
    const Notify = useNotify();

    const [isLoading, setIsLoading] = useState(true);
    const [nodeTypeGroups, setNodeTypeGroups] = useState<NodeTypeGroup[]>([]);
    const [selectedLayout, setSelectedLayout] = useState<chartType>(chartType.SUNBURST);
    const [selectedNodeTypeName, setSelectedNodeTypeName] = useState('');
    const [nodeTypes, setNodeTypes] = useState<NodeTypeConfigurations>({});
    const [invalidNodeTypes, setInvalidNodeTypes] = useState<NodeTypeConfigurations>({});
    const [superTypeFilter, setSuperTypeFilter] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(FilterType.NONE);

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
        return Object.keys(data).map(name => {
            const segmentPath = path ? path + '.' + name : name;
            const node: DataSegment = { name, path: segmentPath };
            if (data[name].name) {
                node['value'] = 1;
                node['data'] = data[name];
            } else {
                node['children'] = processTreeData(data[name], segmentPath);
            }
            return node;
        });
    };

    /**
     * Runs initial request to fetch all nodetype definitions
     */
    useEffect(() => {
        fetchData(actions.getNodeTypeDefinitions, null, 'GET')
            .then((data: any) => {
                const { nodeTypes } = data;

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
                        invalidNodeTypes: {}
                    }
                );

                setNodeTypes(validNodeTypes);
                setInvalidNodeTypes(invalidNodeTypes);

                setIsLoading(false);
            })
            .catch(Notify.error);
    }, []);

    /**
     * Converts flat nodetypes structure into tree
     */
    useEffect(() => {
        if (Object.keys(nodeTypes).length === 0) return;

        const treeData = Object.values(nodeTypes).reduce((carry: object, nodeType) => {
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
            const segments = nodeType.name.split(':');
            return $set(segments.join('.'), nodeType, carry);
        }, {});

        setTreeData(treeData);
    }, [nodeTypes, selectedFilter]);

    /**
     * Converts nodetypes list into a structure for dependency graphs
     */
    useEffect(() => {
        if (Object.keys(nodeTypes).length === 0) return;

        let types = {};

        if (selectedNodeTypeName) {
            const selectedNodeType = nodeTypes[selectedNodeTypeName];
            const typesToAdd = [selectedNodeTypeName];

            while (typesToAdd.length > 0) {
                const typeToAdd = nodeTypes[typesToAdd.pop()];
                const superTypes = typeToAdd.declaredSuperTypes;
                if (superTypes) {
                    Object.keys(superTypes).forEach(superType => {
                        if (superTypes[superType] && Object.keys(types).indexOf(superType) === -1) {
                            typesToAdd.push(superType);
                        }
                    });
                }
                types[typeToAdd.name] = typeToAdd;
            }

            if (selectedNodeType.configuration.superTypes) {
                Object.keys(selectedNodeType.configuration.superTypes).forEach(superType => {
                    if (selectedNodeType.configuration.superTypes[superType]) {
                        types[superType] = nodeTypes[superType];
                    }
                });
            }
        } else {
            types = nodeTypes;
        }

        const data = Object.values(types).reduce<Dependencies>(
            (carry, nodeType: NodeTypeConfiguration) => {
                carry.nodes.children.push({
                    name: nodeType.name,
                    group: nodeType.name.split(':')[0],
                    path: nodeType.name.replace(':', '.'),
                    value: selectedNodeTypeName === nodeType.name ? 2 : 1
                });

                if (nodeType.declaredSuperTypes) {
                    Object.keys(nodeType.declaredSuperTypes).forEach(superType => {
                        carry.links.push({
                            source: nodeType.name,
                            target: superType,
                            type: LinkType.INHERITS,
                            group: superType.split(':')[0]
                        });
                    });
                }
                return carry;
            },
            {
                nodes: {
                    children: []
                },
                links: []
            } as Dependencies
        );

        setDependencyData(data);
    }, [nodeTypes, selectedNodeTypeName]);

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
                actions,
                isLoading,
                selectedNodeTypeName,
                setSelectedNodeTypeName,
                nodeTypeGroups,
                setNodeTypeGroups,
                selectedLayout,
                setSelectedLayout,
                nodeTypes,
                setNodeTypes,
                superTypeFilter,
                setSuperTypeFilter,
                selectedPath,
                setSelectedPath,
                graphData,
                dependencyData,
                treeData,
                selectedFilter,
                setSelectedFilter,
                invalidNodeTypes,
                setInvalidNodeTypes
            }}
        >
            {children}
        </GraphContext.Provider>
    );
}
