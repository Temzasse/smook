import React from 'react';
import { useModel } from '../smook.typed';

const Foo = () => {
  console.log('> Foo | rendering...');
  
  const orderM = useModel('order');
  const numOfOrders = orderM.select(orderM.selectors.getNumOfOrders);

  return <div>Num of orders: {numOfOrders}</div>;
};

export default Foo;
