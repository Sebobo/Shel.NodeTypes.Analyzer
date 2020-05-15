import * as React from 'react';
import { useEffect, useRef } from 'react';
import { $get } from 'plow-js';

import { Action, AppTheme, createUseAppStyles, useGraph } from '../core';
import { renderSunburstChart, renderDependencyGraph } from '../charts';
import { LinkType, DataSegment } from '../interfaces';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    nodeTypesGraph: {
        '.neos &': {
            backgroundColor: theme.colors.contrastDark,
            border: `1px solid ${theme.colors.contrastBright}`,
            minHeight: '800px',
            height: '100%',
            position: 'relative'
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
                    textShadow: '0 2pt 1pt rgba(255, 255, 255, .2)'
                },
                '& .hull': {
                    strokeWidth: '32px',
                    strokeLinejoin: 'round',
                    opacity: 0.2
                }
            }
        }
    }
}));

export default function Graph() {
    const classes = useStyles();
    const graphSvgWrapper = useRef();
    const { graphData, treeData, selectedPath, selectedLayout, dependencyData, dispatch } = useGraph();

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
                            return data.children.find(child => child.name === segment);
                        }, graphData);
                    } else {
                        data = graphData;
                    }
                    chart = renderSunburstChart({ data, width, height });
                    break;
                case 'dependencies':
                    if (dependencyData.nodes.children.length === 0) {
                        return;
                    }
                    chart = renderDependencyGraph({
                        data: dependencyData,
                        types: [LinkType.INHERITS],
                        width,
                        height
                    });
                    break;
            }
            wrapper.appendChild(chart);
        } catch (e) {
            console.error(e);
            return null;
        }

        const graphSvg = wrapper.querySelector('svg');
        graphSvg.addEventListener('click', selectNodeTypeInGraph);

        return () => {
            graphSvg.removeEventListener('click', selectNodeTypeInGraph);
        };
    }, [graphData, selectedPath, dependencyData, selectedLayout]);

    return <div ref={graphSvgWrapper} />;
}
