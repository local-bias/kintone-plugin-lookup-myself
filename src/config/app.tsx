import React, { VFC } from 'react';
import { SnackbarProvider } from 'notistack';

import { Footer, Form, SocialIcons } from './components';
import { RecoilRoot } from 'recoil';
import { pluginIdState, storageState } from './states';
import { restoreStorage } from '@common/plugin';

const Component: VFC<{ pluginId: string }> = ({ pluginId }) => (
  <>
    <RecoilRoot
      initializeState={({ set }) => {
        set(pluginIdState, pluginId);
        set(storageState, restoreStorage(pluginId));
      }}
    >
      <SnackbarProvider maxSnack={3}>
        <Form />
        <Footer />
      </SnackbarProvider>
    </RecoilRoot>
    <SocialIcons />
  </>
);

export default Component;
