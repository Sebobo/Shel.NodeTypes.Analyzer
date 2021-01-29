import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import Button from '@neos-project/react-ui-components/lib-esm/Button';

import { createUseAppStyles, useIntl } from '../core';
import { replModalState } from '../atoms';

const useStyles = createUseAppStyles({
    button: {
        '.neos &': {
            width: '100%',
            marginBottom: '1rem'
        }
    }
});

const ToggleRepl: React.FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const [replModalVisible, setReplModalVisible] = useRecoilState(replModalState);

    const toggleRepl = useCallback(() => setReplModalVisible(!replModalVisible), [replModalVisible]);

    return (
        <Button className={classes.button} onClick={toggleRepl} style="lighter" hoverStyle="brand">
            {translate('repl.toggle', 'Run expression')}
        </Button>
    );
};

export default React.memo(ToggleRepl);
