import React from 'react';
import { useModel } from '../smook.typed';

const Thing = () => {
  const thingM = useModel('thing');
  const things = thingM.select('things');
  const hasError = thingM.select('hasError');
  const isLoading = thingM.select('isLoading');
  const numOfThings = thingM.select(thingM.selectors.getNumOfThings);
  const { addThing, clearThings, fetchThings } = thingM.actions;

  React.useEffect(() => {
    fetchThings();
  }, []);

  // fetchItems();

  // addItem(1);

  // clearItems();

  console.log('> Thing | rendering...');

  return <div>Things here...</div>;
};

export default Thing;
