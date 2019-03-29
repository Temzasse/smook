import React from 'react';
import { useModel } from '../smook';
import { Models } from '../store';

const Thing = () => {
  const thingM = useModel<Models, 'thing'>('thing');
  const things = thingM.select('things');
  const hasError = thingM.select('hasError');
  const isLoading = thingM.select('isLoading');
  const numOfThings = thingM.select(thingM.selectors.getNumOfThings);
  const { addThing, clearThings, fetchThings, saveThing } = thingM.actions;

  React.useEffect(() => {
    fetchThings();
  }, []);

  // saveThing({
  //   bar: 1,
  //   foo: '1',
  // });

  // fetchItems();

  // addItem(1);

  // clearItems();

  return <div>Typed</div>;
};

export default Thing;
