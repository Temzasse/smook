import React from 'react';
import { StoreProvider } from './smook';
import store from './ts/store';

// Components
import Thing from './ts/thing/Thing';
import Orders from './ts/order/Orders';
import Profile from './ts/user/Profile';

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
