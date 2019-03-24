import { effect, fetchable } from '../smook';
import { sleep } from '../helpers';

const orderModel = {
  name: 'user',

  state: {
    profile: fetchable.value(null),
  },

  selectors: {
    getFullName: ({ user }) =>
      user.profile.data
        ? `${user.profile.data.firstName} ${user.profile.data.lastName}`
        : '',
  },

  actions: {
    setProfile: fetchable.reducer('profile'),

    fetchProfile: effect(async function(self, getState, args) {
      try {
        self.actions.setProfile(fetchable.loading); // show loading spinner

        await sleep(); // mock API call

        const profile = {
          firstName: 'Teemu',
          lastName: 'Taskula',
          githubUrl: 'https://github.com/Temzasse',
        };

        self.actions.setProfile(fetchable.success(profile));
      } catch (error) {
        console.log('> Error in fetchProfile', error);
        self.actions.setProfile(fetchable.error(error.message));
      }
    }),
  },
};

export default orderModel;
