import React from 'react';
import { StoreProvider, createStore } from './smook';

// Models
import orderModel from './js/order/order.model';
import userModel from './js/user/user.model';
import thingModel from './ts/thing/thing.model';

// Components
import Thing from './ts/thing/Thing';
// import Orders from './order/Orders';
// import Profile from './user/Profile';

const store = createStore([userModel, orderModel, thingModel]);

const App = () => (
  <div>
    <StoreProvider store={store}>
      {/* <Orders /> */}
      {/* <Profile /> */}
      <Thing />
    </StoreProvider>
  </div>
);

export default App;
