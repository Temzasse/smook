import React from 'react';
import { StoreProvider } from 'smook';
import store from './store';

// Components
import Thing from './thing/Thing';
import Orders from './order/Orders';
import Profile from './user/Profile';

const App = () => (
  <div>
    <StoreProvider store={store}>
      <Thing />
      <Orders />
      <Profile />
    </StoreProvider>
  </div>
);

export default App;
