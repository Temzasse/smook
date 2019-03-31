import { createStore } from './smook';
import userModel, { State as UserS, UserModel } from './user/user.model';
import thingModel, { State as ThingS, ThingModel } from './thing/thing.model';
import orderModel, { State as OrderS, OrderModel } from './order/order.model';

export interface Models {
  thing: ThingModel;
  user: UserModel;
  order: OrderModel;
}

export interface RootState {
  thing: ThingS;
  user: UserS;
  order: OrderS;
}

const store = createStore([thingModel, orderModel, userModel]);

export default store;
