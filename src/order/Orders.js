import React from 'react';
import styled from 'styled-components';
import { useModel } from '../smook';

const Orders = () => {
  const [orderName, setOrderName] = React.useState('');
  const orderM = useModel('order');
  const userM = useModel('user');
  const fullName = userM.select(userM.selectors.getFullName);
  const orders = orderM.select('orders');
  const numOfOrders = orderM.select(orderM.selectors.getNumOfOrders);
  const fetchOrders = orderM.action('fetchOrders');
  const _addOrder = orderM.action('addOrder');

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = () => {
    if (orderName) {
      _addOrder(orderName);
      setOrderName('');
    }
  };

  console.log('> Orders | rendering...');

  return (
    <Wrapper>
      <h1>Orders:</h1>

      <h3>For user {fullName}</h3>

      {orders.status === 'LOADING' && <div>Loading orders...</div>}

      {orders.status === 'FAILURE' && <div>Failed to fetch orders</div>}

      {orders.status === 'SUCCESS' && (
        <ul>
          {orders.data.map(order => (
            <li key={order.id}>{order.name}</li>
          ))}
        </ul>
      )}

      <br />

      <div>Number of orders: {numOfOrders}</div>

      <br />

      <input value={orderName} onChange={e => setOrderName(e.target.value)} />
      <br />
      <button onClick={addOrder}>Add order</button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  min-height: 300px;
  margin: 32px auto;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 1px 12px rgba(0, 0, 0, 0.1);
`;

export default Orders;
