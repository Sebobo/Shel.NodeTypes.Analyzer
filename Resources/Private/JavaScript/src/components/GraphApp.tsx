import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import svgPanZoom from 'svg-pan-zoom';
import dotProp from 'dot-prop';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import searchForKeys from 'keys-in-object';

import { useGraph } from '../core';
import Toolbar from './Toolbar';

const useStyles = createUseStyles({
    nodeTypesGraph: {
        '.neos &': {
            marginLeft: '2rem',
            backgroundColor: 'gray',
            border: '1px solid lightgray'
        },
        '& object': {
            display: 'none'
        },
        '& svg': {
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            '& g': {
                '&.node': {
                    cursor: 'pointer',
                    transition: 'opacity .1s ease-in',
                    '&:hover': {
                        '& polygon, & ellipse': {
                            fill: '#00b3ee'
                        },
                        '& text': {
                            fill: '#fff'
                        }
                    },
                    '& polygon, & ellipse': {
                        transition: 'strokeWidth .1s ease-in'
                    }
                }
            }
        }
    },
    nodeMatchesFilter: {
        '& polygon, & ellipse': {
            strokeWidth: '5px'
        }
    },
    nodeDoesNotMatchFilter: {
        opacity: '.5'
    }
});

export default function GraphApp() {
    const classes = useStyles({});
    const {
        graphSvgWrapper,
        setSelectedNodeTypeName,
        nodeTypes,
        superTypeFilter,
        configurationPathFilter,
        graphVersion,
        graphSvgData,
        setGraphVersion
    } = useGraph();

    // Graph interactions
    const selectNodeTypeInGraph = (e: MouseEvent): void => {
        const graphNode = e.target as HTMLElement;
        const nodeTypeName = graphNode.closest('g').querySelector('title').textContent;
        setSelectedNodeTypeName(nodeTypeName);
    };

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
                          !configurationPathFilter ||
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
        <div>
            <Toolbar />
        </div>
    );
}
