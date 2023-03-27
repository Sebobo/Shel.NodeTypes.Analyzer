import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { $get } from 'plow-js';
import cloneDeep from 'lodash.clonedeep';

import { Action, AppTheme, createUseAppStyles, useGraph } from '../../core';
import { renderSunburstChart, renderDependencyGraph } from '../../charts';
import { graphDataState, treeDataState } from '../../state';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    nodeTypesGraph: {
        '.neos &': {
            backgroundColor: theme.colors.contrastDark,
            border: `1px solid ${theme.colors.contrastBright}`,
            flex: 1,
            position: 'relative',
        },
        '& svg': {
            width: '100%',
            height: '100%',
            position: 'absolute',
            '& g': {
                '& text.node': {
                    cursor: 'pointer',
                    stroke: 'black',
                    strokeWidth: '0.2px',
                    textShadow: '0 2pt 1pt rgba(255, 255, 255, .2)',
                },
                '& .hull': {
                    strokeWidth: '32px',
                    strokeLinejoin: 'round',
                    opacity: 0.2,
                },
            },
        },
    },
}));

const MAX_SUB_SEGMENTS = 10;

const Graph: React.FC = () => {
    const classes = useStyles();
    const graphSvgWrapper = useRef();
    const { selectedPath, selectedLayout, dependencyData, dispatch } = useGraph();
    const treeData = useRecoilValue(treeDataState);
    const graphData = useRecoilValue(graphDataState);

    const selectNodeTypeInGraph = ({ target }): void => {
        if (target instanceof Element && target.tagName === 'text' && target.classList.contains('node')) {
            const path = target.getAttribute('path');
            const selection = $get(path, treeData);
            if (selection?.nodeType) {
                dispatch({ type: Action.SelectNodeType, payload: selection.nodeType });
            } else {
                dispatch({ type: Action.SelectPath, payload: path });
            }
        }
    };

    /**
     * Reduces the visual complexity of a deeply nested graph with many subnodes
     *
     * @param data
     * @param maxDepth
     * @param maxChildren
     * @param depth
     */
    const reduceHierarchyComplexity = (
        data: DataSegment,
        maxDepth,
        maxChildren = MAX_SUB_SEGMENTS,
        depth = 1
    ): DataSegment => {
        if (data.children) {
            if (depth < maxDepth || data.children.length < maxChildren) {
                data.children = data.children.map((childData) =>
                    reduceHierarchyComplexity(childData, maxDepth, maxChildren, depth + 1)
                );
            } else {
                data.children = [
                    {
                        name: `>${MAX_SUB_SEGMENTS} types`,
                        path: data.path,
                        value: MAX_SUB_SEGMENTS,
                    },
                ];
            }
        }
        return data;
    };

    useEffect(() => {
        if (Object.keys(graphData).length === 0) return;

        const wrapper = graphSvgWrapper.current as HTMLElement;
        wrapper.className = classes.nodeTypesGraph;
        wrapper.innerHTML = '';
        const { offsetWidth: width, offsetHeight: height } = wrapper;

        let chart = null;
        let data = null;

        try {
            switch (selectedLayout) {
                case 'sunburst':
                    if (selectedPath) {
                        data = selectedPath.split('.').reduce<DataSegment>((data, segment) => {
                            return data.children.find((child) => child.name === segment);
                        }, graphData);
                    } else {
                        data = graphData;
                    }
                    // Use a cloned version before modifying the data
                    data = reduceHierarchyComplexity(cloneDeep(data), selectedPath.split('.').length + 2);
                    chart = renderSunburstChart({ data, width, height });
                    break;
                case 'dependencies':
                    if (dependencyData.nodes.children.length === 0) {
                        return;
                    }
                    chart = renderDependencyGraph({
                        data: dependencyData,
                        types: ['inherits'],
                        width,
                        height,
                    });
                    break;
            }
            wrapper.appendChild(chart);
        } catch (e) {
            console.error(e);
            return;
        }

        const graphSvg = wrapper.querySelector('svg');
        graphSvg.addEventListener('click', selectNodeTypeInGraph);

        return () => {
            graphSvg.removeEventListener('click', selectNodeTypeInGraph);
        };
    }, [graphData, selectedPath, dependencyData, selectedLayout]);

    return <div ref={graphSvgWrapper} />;
};

export default React.memo(Graph);
