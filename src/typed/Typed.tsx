import React from 'react';
import { useModel } from './smook';
import { Models } from './store';

const Orders = () => {
  const thingM = useModel<Models, 'thing'>('thing');
  const items = thingM.select('items');
  const foo = thingM.select('foo');
  const bar = thingM.select('bar');
  const numOfItems = thingM.select(thingM.selectors.getNumOfItems);
  const { addItem, clearItems, fetchItems, saveThing } = thingM.actions;

  saveThing({
    bar: 1,
    foo: '1',
  });

  fetchItems();

  addItem(1);

  clearItems();

  return <div>Typed</div>;
};

export default Orders;
