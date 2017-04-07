import Ember from 'ember';

export default Ember.Route.extend({

  model({ id }) {
    return this.get('store').findRecord('rental', id)
  },

  setupController(controller, rental) {
    let booking = this.get('store').createRecord('booking', { rental })
    controller.set('rental', rental)
    controller.set('booking', booking)
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.get('rental.bookings').forEach(function(booking) {
        if (booking.get('isNew')) {
          booking.destroyRecord()
        } else {
          booking.rollbackAttributes()
        }
      })
      controller.set('selectedBookingId', null)
    }
  }

});
