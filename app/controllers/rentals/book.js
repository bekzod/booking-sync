import Ember from 'ember';
import moment from 'moment';

const { computed } = Ember

export default Ember.Controller.extend({
  center: moment(),
  minDate: moment().startOf('day'),

  range: computed('booking.startAt', 'booking.endAt', {
    get() {
      let booking = this.get('booking')
      return {
        start: booking.get('startAt'),
        end: booking.get('endAt')
      }
    },
    set(key, val) {
      let { start, end } = val
      this.get('booking').setProperties({ startAt: start, endAt: end })
      return val
    }
  }),

  disabledDates: computed('rental.bookings', function() {
    return this.get('rental.bookings').reduce(function(dates, booking) {
      let startAt = booking.get('startAt')
      let endAt = booking.get('endAt')
      let date = moment(startAt)
      while (date.isBefore(endAt)) {
        dates.push(date.toDate())
        date.add(1, 'day')
      }
      return dates
    }, [])
  }),

  days: computed('booking.startAt', 'booking.endAt', function() {
    let days = 0
    let booking = this.get('booking')
    let { startAt, endAt } = booking.getProperties('startAt', 'endAt')
    if (startAt !== null && endAt !== null) {
      days = moment(endAt).diff(startAt, 'days')
    }
    return days
  }),

  calculatePrice() {
    let price = this.get('days') * this.get('rental.dailyRate')
    this.set('booking.price', price)
  },

  actions: {
    setRange(range) {
      this.set('range', range)
      this.calculatePrice()
    },

    close() {
      this.transitionToRoute('rentals')
    }
  }

});
