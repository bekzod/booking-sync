import Ember from 'ember';
import moment from 'moment';
import { animate } from 'ember-animatable';


const { computed, inject } = Ember

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default Ember.Controller.extend({
  notification: inject.service('notification-messages'),

  minDate: moment().startOf('day'),
  //centering to first available day
  center: computed('disabledDates', {
    get() {
      let center = moment()
      let disabledDates = this.get('disabledDates')
      for (var i = 0; i < disabledDates.length; i++) {
        let disabledDate = disabledDates[i]
        if (center.isSame(disabledDate, 'day')) {
          center.add(1, 'day')
        }
      }
      return center;
    },
    set(key, val) {
      return val
    }
  }),

  isEmailValid: computed('booking.clientEmail', function() {
    return EMAIL_REGEX.test(this.get('booking.clientEmail'))
  }),

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
      if (this.validateRange(start, end)) {
        this.get('booking').setProperties({ startAt: start, endAt: end })
        return val
      } else {
        this.get('notification').warning('Booking dates cannot overlap')
        animate('.ember-power-calendar', 'shake')
        return { end: null, start: null }
      }
    }
  }),

  validateRange(start, end) {
    if (!start || !end) { return true }
    let bookings = this.get('rental.bookings')
    let startAt = moment(start)
    let endAt = moment(end)
    return !bookings.any(function(booking) {
      let bookingStart = booking.get('startAt')
      let bookingEnd = booking.get('endAt')
      return startAt.isBefore(bookingStart) && endAt.isAfter(bookingEnd)
    })
  },

  disabledDates: computed('rental.bookings', function() {
    return this.get('rental.bookings').reduce(function(dates, booking) {
      if (!booking.get('isNew')) {
        let startAt = booking.get('startAt')
        let endAt = booking.get('endAt')
        let date = moment(startAt)
        while (date.isBefore(endAt) || date.isSame(endAt, 'day')) {
          dates.push(date.toDate())
          date.add(1, 'day')
        }
      }
      return dates
    }, []).sort((a,b)=> a - b);
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

    book() {
      this.set('isSaving', true)
      this.get('booking').save()
        .then(()=> {
          this.get('notification').success('Saved successfully!')
          this.transitionToRoute('rentals')
        })
        .catch((e)=> {
          console.error(e)
          this.get('notification').error('Something went wrong, we are working on it')
        })
        .finally(()=> {
          this.set('isSaving', false)
        })
    },

    close() {
      this.transitionToRoute('rentals')
    }
  }

});
