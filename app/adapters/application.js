import DS from 'ember-data';

const { computed, inject } = Ember

export default DS.JSONAPIAdapter.extend({
  namespace: 'api',
  session: inject.service(),

  headers: computed('session.authToken',  function () {
    return {
      'x-authentication': this.get('session.authToken')
    }
  })

});
