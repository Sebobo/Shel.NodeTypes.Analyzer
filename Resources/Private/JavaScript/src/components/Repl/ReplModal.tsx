import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import Terminal from 'react-console-emulator';

import Modal from '../Modal';
import { replModalState } from '../../atoms';
import { AppTheme, createUseAppStyles, useGraph, useIntl } from '../../core';
import { ContextData } from '../../interfaces';

const useStyles = createUseAppStyles((theme: AppTheme) => ({}));

const ReplModal: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const { evaluateEelExpression, getContextData, flushCache } = useGraph();
    const [showReplModal, setShowReplModal] = useRecoilState(replModalState);
    const terminal = useRef<Terminal>();
    const [contextData, setContextData] = useState<ContextData>({
        user: {
            name: 'unknown',
            label: 'Unknown'
        },
        currentSite: {
            name: 'unknown',
            nodeName: 'unknown',
            primaryDomain: 'unknown'
        }
    });

    const evaluate = useCallback(async expression => {
        return evaluateEelExpression(encodeURIComponent(expression)).then(result => {
            return typeof result === 'string' ? result : translate('repl.modal.invalidResult', 'Invalid result');
        });
    }, []);

    useEffect(() => {
        if (!showReplModal) return;

        getContextData().then(result => {
            if (result) setContextData(result);
        });
    }, [showReplModal, setContextData]);

    const commands = useMemo(() => {
        return {
            echo: {
                description: translate('repl.modal.eel', 'Echo a passed string.'),
                usage: 'echo <string>',
                fn: (...args) => `${args.join(' ')}`
            },
            eel: {
                description: translate('repl.modal.eel', 'Run an expression through the eel parser'),
                usage: 'eel <string>',
                fn: (...args) => {
                    const currentTerminal = terminal.current;
                    evaluate(args.join('')).then(result => {
                        currentTerminal.state.stdout.pop();
                        currentTerminal.pushToStdout(result);
                    });
                    return translate('repl.modal.evaluating', 'Evaluating...');
                }
            },
            flushCache: {
                description: translate('repl.command.flushCache', 'Flush all or a single cache'),
                usage: 'flushCache <string>',
                fn: (...args) => {
                    const currentTerminal = terminal.current;
                    flushCache(args.join('')).then(result => {
                        currentTerminal.state.stdout.pop();
                        currentTerminal.pushToStdout(
                            result !== undefined
                                ? result
                                : translate('repl.modal.flushCache.error', 'An error occurred')
                        );
                    });
                    return translate('repl.modal.flushing', 'Flushing...');
                }
            }
        };
    }, [terminal]);

    const promptLabel = useMemo(() => {
        return `${contextData.user.name}@${contextData.currentSite.nodeName}:~$`;
    }, [contextData]);

    if (!showReplModal) return null;

    return (
        <Modal isOpen={true} label={'Eel Repl'} onClose={() => setShowReplModal(false)}>
            <Terminal
                autoFocus={true}
                ref={terminal}
                commands={commands}
                welcomeMessage={'Welcome to the Eel terminal'}
                promptLabel={promptLabel}
                contentStyle={{ color: '#00ADEE' }}
                styleEchoBack="fullInherit"
                promptLabelStyle={{ color: '#ff8700' }}
                inputTextStyle={{ color: 'white' }}
            />
        </Modal>
    );
};

export default React.memo(ReplModal);
