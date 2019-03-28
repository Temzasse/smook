import { effect, fetchable } from '../smook';
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

    fetchOrders: effect(async function(models, args) {
      try {
        models.order.actions.setOrders(fetchable.loading); // show loading spinner

        await sleep(1000); // mock API call

        const orders = [
          { id: 1, name: 'Coffee beans' },
          { id: 2, name: 'Amazing coffee beans grinder' },
          { id: 3, name: 'Bananas' },
        ];

        models.order.actions.setOrders(fetchable.success(orders));

        await sleep(3000);
        models.user.actions.fetchProfile();
      } catch (error) {
        console.log('> Error in fetchOrders', error);
        models.order.actions.setOrders(fetchable.error(error.message));
      }
    }),
  },
};

export default orderModel;
