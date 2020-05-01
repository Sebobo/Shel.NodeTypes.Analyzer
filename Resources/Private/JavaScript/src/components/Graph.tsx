import * as React from 'react';
import { useEffect, useRef } from 'react';
import { $get } from 'plow-js';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import svgPanZoom from 'svg-pan-zoom';

import { AppTheme, createUseAppStyles, useGraph } from '../core';
import { renderSunburstChart } from '../helpers/sunburst';
import { DataSegment } from '../interfaces';

const useStyles = createUseAppStyles((theme: AppTheme) => ({
    nodeTypesGraph: {
        '.neos &': {
            backgroundColor: theme.colors.contrastDark,
            border: `1px solid ${theme.colors.contrastBright}`
        },
        '& svg': {
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            '& g': {
                '& text.node': {
                    cursor: 'pointer'
                }
            }
        }
    }
}));

export default function Graph() {
    const classes = useStyles();
    const graphSvgWrapper = useRef();
    const { setSelectedNodeTypeName, graphData, treeData, selectedPath, setSelectedPath } = useGraph();

    const selectNodeTypeInGraph = (e: MouseEvent): void => {
        const graphNode = e.target as HTMLElement;
        const path = graphNode.getAttribute('path');
        const selection = $get(path, treeData);
        if (selection?.name) {
            setSelectedNodeTypeName(selection.name);
        } else {
            setSelectedPath(path);
        }
    };

    useEffect(() => {
        if (Object.keys(graphData).length === 0) return;

        let chartData = graphData;
        if (selectedPath) {
            chartData = selectedPath.split('.').reduce<DataSegment>((data, segment) => {
                return data.children.find(child => child.name === segment);
            }, graphData);
        }

        const chart = renderSunburstChart({
            data: chartData
        });

        const wrapper = graphSvgWrapper.current as HTMLElement;

        wrapper.className = classes.nodeTypesGraph;
        wrapper.innerHTML = '';
        wrapper.appendChild(chart);

        const graphSvg = wrapper.querySelector('svg');
        const nodes = graphSvg.querySelectorAll('text.node');
        nodes.forEach(node => node.addEventListener('click', selectNodeTypeInGraph));

        // Init svg pan and zoom functionality
        const panZoom = svgPanZoom(graphSvg, {});

        return () => {
            nodes.forEach(node => node.removeEventListener('click', selectNodeTypeInGraph));
            panZoom.destroy();
        };
    }, [graphData, selectedPath]);

    return <div ref={graphSvgWrapper} />;
}
