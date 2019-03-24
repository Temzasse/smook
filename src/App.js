import React from 'react';
import { StoreProvider, createStore } from './remesh';

import orderModel from './order/order.model';
import userModel from './user/user.model';

import Orders from './order/Orders';
import Profile from './user/Profile';

const store = createStore([userModel, orderModel]);

const App = () => (
  <div>
    <StoreProvider store={store}>
      <Orders />
      <Profile />
    </StoreProvider>
  </div>
);

export default App;
