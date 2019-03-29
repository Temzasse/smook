import React from 'react';
import styled from 'styled-components';

const Sidemenu = ({ profile }) => {
  return (
    <Wrapper>
      
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
  box-shadow: 0px 3px 12px rgba(0, 0, 0, 0.1);
`;

export default React.memo(Sidemenu);
