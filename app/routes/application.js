import Ember from 'ember';

const { inject } = Ember

export default Ember.Route.extend({
  notifications: inject.service('notification-messages'),

  beforeModel() {
    let notifications = this.get('notifications')
    notifications.setDefaultAutoClear(true)
    notifications.setDefaultClearDuration(5000)
  }
})
