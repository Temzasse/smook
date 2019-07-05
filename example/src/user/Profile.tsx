import React from 'react';
import styled from 'styled-components';
import { useModel } from '../smook.typed';
import Foo from './Foo';

const Profile = () => {
  const userM = useModel('user');
  const profile = userM.select('profile');
  const isLoggedIn = userM.select('isLoggedIn');
  const { fetchProfile, login, logout } = userM.actions;

  React.useEffect(() => {
    fetchProfile();
  }, []); // eslint-disable-line

  console.log('> Profile | rendering...');

  return (
    <Wrapper>
      <h1>Profile:</h1>

      <div>Is logged in: {isLoggedIn ? 'Yes' : 'No'}</div>

      <br />

      <button onClick={() => (isLoggedIn ? logout() : login())}>
        {isLoggedIn ? 'Logout' : 'Login'}
      </button>

      {profile.status === 'LOADING' && <div>Loading profile...</div>}

      {profile.status === 'FAILURE' && <div>Failed to load profile!</div>}

      {profile.status === 'SUCCESS' && (
        <>
          <dl>
            <dt>First name</dt>
            <dd>{profile.data.firstName}</dd>

            <dt>Last name</dt>
            <dd>{profile.data.lastName}</dd>

            <dt>Github</dt>
            <dd>
              <a
                href={profile.data.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.data.githubUrl}
              </a>
            </dd>
          </dl>
        </>
      )}

      <br />

      <Foo />
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

export default Profile;
