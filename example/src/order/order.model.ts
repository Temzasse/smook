import { Action, Model, fetchable, FetchableValue } from 'smook';
import { effect } from '../smook.typed';
import { sleep } from '../helpers';
import { Order } from './order.types';

export interface State {
  orders: FetchableValue<Order[]>;
}

const orderModel = {
  name: 'order',

  state: {
    orders: fetchable.value([]),
  },

  selectors: {
    getNumOfOrders: ({ order }) => order.orders.data.length,
  },

  actions: {
    addOrder: (state: State, action: Action<string>) => ({
      // TODO: use `immer`
      ...state,
      orders: {
        ...state.orders,
        data: [
          ...state.orders.data,
          { id: state.orders.data.length + 1, name: action.payload },
        ],
      },
    }),

    setOrders: fetchable.reducer<State, 'orders'>('orders'),

    fetchOrders: effect(async function(models) {
      console.log('> models', models);
      try {
        // Show loading spinner
        models.order.actions.setOrders(fetchable.loading());

        await sleep(1000); // mock API call

        const orders = [
          { id: 1, name: 'Coffee beans' },
          { id: 2, name: 'Amazing coffee beans grinder' },
          { id: 3, name: 'Bananas' },
        ];

        models.order.actions.setOrders(fetchable.success(orders));

        console.log('> Refetching profile in 10 seconds...');
        await sleep(10000);
        models.user.actions.fetchProfile();
      } catch (error) {
        console.log('> Error in fetchOrders', error);
        models.order.actions.setOrders(fetchable.failure(error.message));
      }
    }),
  },
};

export type OrderModel = Model<typeof orderModel, State>;

export default orderModel;
