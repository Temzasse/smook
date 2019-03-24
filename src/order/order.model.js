import { effect, fetchable } from '../remesh';
import { sleep } from '../helpers';

const orderModel = {
  name: 'order',

  state: {
    orders: fetchable.value([]),
  },

  selectors: {
    getNumOfOrders: ({ order }) => order.orders.data.length,
  },

  actions: {
    addOrder: (state, action) => ({
      ...state,
      orders: {
        ...state.orders,
        data: [
          ...state.orders.data,
          { id: state.orders.data.length + 1, name: action.payload },
        ],
      },
    }),

    setOrders: fetchable.reducer('orders'),

    fetchOrders: effect(async function(self, args) {
      try {
        self.actions.setOrders(fetchable.loading); // show loading spinner

        await sleep(1000); // mock API call

        const orders = [
          { id: 1, name: 'Coffee beans' },
          { id: 2, name: 'Amazing coffee beans grinder' },
          { id: 3, name: 'Bananas' },
        ];

        self.actions.setOrders(fetchable.success(orders));
      } catch (error) {
        console.log('> Error in fetchOrders', error);
        self.actions.setOrders(fetchable.error(error.message));
      }
    }),
  },
};

export default orderModel;
