import React from 'react';
import { StoreProvider } from './smook';
import store from './ts/store';

// Components
import Thing from './ts/thing/Thing';

const App = () => (
  <div>
    <StoreProvider store={store}>
      <Thing />
    </StoreProvider>
  </div>
);

export default App;
