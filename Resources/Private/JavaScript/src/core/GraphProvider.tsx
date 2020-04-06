import * as React from 'react';
import { useEffect, useContext, createContext, useState } from 'react';

import { Actions, NodeTypeGroup, NodeTypeConfiguration } from '../interfaces';
import fetchData from '../helpers/fetchData';
import { useNotify } from './Notify';

export interface GraphProviderProps {
    children: React.ReactElement;
    csrfToken: string;
    actions: Actions;
    graphSvgWrapper: HTMLElement;
    selectableLayouts: { [index: string]: string };
}

interface GraphProviderValues {
    csrfToken: string;
    actions: Actions;
    graphSvgWrapper: HTMLElement;
    selectableLayouts: { [index: string]: string };
    isSendingData: boolean;
    setIsSendingData: (isSendingData: boolean) => void;
    selectedNodeTypeName: string;
    setSelectedNodeTypeName: (selectedNodeTypeName: string) => void;
    selectedLayout: string;
    setSelectedLayout: (layout: string) => void;
    nodeTypeGroups: NodeTypeGroup[];
    setNodeTypeGroups: (nodeTypeGroups: NodeTypeGroup[]) => void;
    nodeTypes: NodeTypeConfigurations;
    setNodeTypes: (nodeTypes: NodeTypeConfigurations) => void;
    configurationPathFilter: string;
    setConfigurationPathFilter: (filter: string) => void;
    superTypeFilter: string;
    setSuperTypeFilter: (filter: string) => void;
    graphSvgData: string;
    setGraphSvgData: (graphSvgData: string) => void;
    graphVersion: number;
    setGraphVersion: (version: number) => void;
}

interface NodeTypeConfigurations {
    [index: string]: NodeTypeConfiguration;
}

export const GraphContext = createContext({} as GraphProviderValues);
export const useGraph = () => useContext(GraphContext);

export default function GraphProvider({
    children,
    csrfToken,
    actions,
    graphSvgWrapper,
    selectableLayouts
}: GraphProviderProps) {
    const Notify = useNotify();

    const [isSendingData, setIsSendingData] = useState(false);
    const [nodeTypeGroups, setNodeTypeGroups] = useState<NodeTypeGroup[]>([]);
    const [selectedLayout, setSelectedLayout] = useState<string>(Object.keys(selectableLayouts)[0]);
    const [selectedNodeTypeName, setSelectedNodeTypeName] = useState('');
    const [nodeTypes, setNodeTypes] = useState<NodeTypeConfigurations>({});
    const [configurationPathFilter, setConfigurationPathFilter] = useState('');
    const [superTypeFilter, setSuperTypeFilter] = useState('');
    const [graphSvgData, setGraphSvgData] = useState('');
    const [graphVersion, setGraphVersion] = useState(0);

    /**
     * Runs initial request to fetch all nodetype definitions
     */
    useEffect(() => {
        fetchData(actions.getNodeTypeDefinitions, null, 'GET')
            .then((data: any) => {
                const { nodeTypes } = data;
                setNodeTypes(nodeTypes);
            })
            .catch(Notify.error);
    }, []);

    return (
        <GraphContext.Provider
            value={{
                csrfToken,
                actions,
                graphSvgWrapper,
                selectableLayouts,
                isSendingData,
                setIsSendingData,
                selectedNodeTypeName,
                setSelectedNodeTypeName,
                nodeTypeGroups,
                setNodeTypeGroups,
                selectedLayout,
                setSelectedLayout,
                nodeTypes,
                setNodeTypes,
                configurationPathFilter,
                setConfigurationPathFilter,
                superTypeFilter,
                setSuperTypeFilter,
                graphSvgData,
                setGraphSvgData,
                graphVersion,
                setGraphVersion
            }}
        >
            {children}
        </GraphContext.Provider>
    );
}
