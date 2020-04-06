import * as React from 'react';
import { useRef, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import IconButton from '@neos-project/react-ui-components/lib-esm/IconButton';

import NodeTypeProfile from './NodeTypeProfile';
import fetchData from '../helpers/fetchData';
import { useGraph, useIntl, useNotify } from '../core';

const useStyles = createUseStyles({
    toolbar: {
        width: '100%'
    },
    form: {
        '& .row': {
            display: 'flex'
        },
        '& .neos-control-group': {
            flex: 1
        }
    },
    buttons: {
        '.neos &': {
            margin: '0 -.5rem',
            '& > button': {
                margin: '0 .5rem'
            }
        }
    }
});

export default function Toolbar() {
    const classes = useStyles();
    const Notify = useNotify();
    const { translate } = useIntl();
    const {
        selectableLayouts,
        actions,
        csrfToken,
        isSendingData,
        setIsSendingData,
        selectedLayout,
        selectedNodeTypeName,
        setSelectedNodeTypeName,
        setSelectedLayout,
        setNodeTypeGroups,
        setGraphSvgData,
        nodeTypes,
        setSuperTypeFilter,
        setConfigurationPathFilter
    } = useGraph();

    // Input references
    const configurationPathFilterRef = useRef(null);
    const superTypeFilterRef = useRef(null);

    const submitForm = (event?: React.FormEvent<HTMLFormElement>): void => {
        if (event) event.preventDefault();

        setIsSendingData(true);

        const data = {
            __csrfToken: csrfToken,
            moduleArguments: {
                layout: selectedLayout,
                baseNodeType: selectedNodeTypeName
            }
        };

        fetchData(actions.renderGraphSvg, data)
            .then((data: any) => {
                const { svgData, nodeTypeGroups } = data;
                setNodeTypeGroups(nodeTypeGroups);
                setGraphSvgData(svgData);
            })
            .catch(Notify.error)
            .finally(() => setIsSendingData(false));
    };

    /**
     * Reload the graph when a node is selected
     */
    useEffect(() => {
        submitForm();
    }, [selectedNodeTypeName]);

    return (
        <div className={classes.toolbar}>
            <form onSubmit={e => submitForm(e)} className={classes.form}>
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
                        <label htmlFor="configurationPathFilter" className="neos-control-label">
                            {translate('field.configurationPath.label', 'Filter configuration path')}
                        </label>
                        <input
                            id="configurationPathFilter"
                            name="configurationPathFilter"
                            type="text"
                            ref={configurationPathFilterRef}
                            onChange={e => setConfigurationPathFilter(configurationPathFilterRef.current.value)}
                        />
                    </div>

                    <div className="neos-control-group">
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
                            {Object.keys(nodeTypes)
                                .sort((a, b) => (a < b ? -1 : 1))
                                .map(nodeTypeName => (
                                    <option key={nodeTypeName}>{nodeTypeName}</option>
                                ))}
                        </select>
                    </div>

                    <div className="neos-control-group">
                        <label htmlFor="superTypeFilter" className="neos-control-label">
                            {translate('field.actions.label', 'Actions')}
                        </label>
                        <div className={classes.buttons}>
                            <IconButton
                                disabled={isSendingData}
                                style="clean"
                                hoverStyle="brand"
                                size="regular"
                                icon="paint-brush"
                                onClick={e => submitForm(e)}
                                title={translate('action.renderGraph', 'Render graph')}
                            />

                            <IconButton
                                disabled={isSendingData}
                                icon="recycle"
                                style="clean"
                                hoverStyle="warn"
                                size="regular"
                                onClick={e => setSelectedNodeTypeName('')}
                                title={translate('action.resetGraph', 'Reset graph')}
                            />
                        </div>
                    </div>
                </div>
            </form>

            {selectedNodeTypeName && (
                <NodeTypeProfile
                    nodeTypeName={selectedNodeTypeName}
                    nodeTypeConfiguration={nodeTypes[selectedNodeTypeName]}
                />
            )}
        </div>
    );
}
