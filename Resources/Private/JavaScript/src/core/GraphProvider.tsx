import * as React from 'react';
import { useEffect, useContext, createContext, useState } from 'react';
import { $set } from 'plow-js';

import { Actions, NodeTypeGroup, NodeTypeConfiguration, DataSegment } from '../interfaces';
import fetchData from '../helpers/fetchData';
import { useNotify } from './Notify';

export interface GraphProviderProps {
    children: React.ReactElement;
    actions: Actions;
}

interface GraphProviderValues {
    actions: Actions;
    isLoading: boolean;
    selectedNodeTypeName: string;
    setSelectedNodeTypeName: (selectedNodeTypeName: string) => void;
    selectedLayout: string;
    setSelectedLayout: (layout: string) => void;
    nodeTypeGroups: NodeTypeGroup[];
    setNodeTypeGroups: (nodeTypeGroups: NodeTypeGroup[]) => void;
    nodeTypes: NodeTypeConfigurations;
    setNodeTypes: (nodeTypes: NodeTypeConfigurations) => void;
    superTypeFilter: string;
    setSuperTypeFilter: (filter: string) => void;
    selectedPath: string;
    setSelectedPath: (path: string) => void;
    graphData: DataSegment;
    treeData: object;
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
    const [selectedLayout, setSelectedLayout] = useState<string>('sunburst');
    const [selectedNodeTypeName, setSelectedNodeTypeName] = useState('');
    const [nodeTypes, setNodeTypes] = useState<NodeTypeConfigurations>({});
    const [superTypeFilter, setSuperTypeFilter] = useState('');
    const [selectedPath, setSelectedPath] = useState('');

    // Data structure for rendering the nodetype tree
    const [treeData, setTreeData] = useState({});
    // Data structure for rendering graphical charts
    // TODO: Use same structure for tree and charts
    const [graphData, setGraphData] = useState({} as DataSegment);

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
                setNodeTypes(nodeTypes);
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
            const segments = nodeType.name.split(':');
            return $set(segments.join('.'), nodeType, carry);
        }, {});

        setTreeData(treeData);
    }, [nodeTypes]);

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
                treeData
            }}
        >
            {children}
        </GraphContext.Provider>
    );
}
