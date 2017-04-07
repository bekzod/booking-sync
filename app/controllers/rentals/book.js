import Ember from 'ember';
import moment from 'moment';
import { animate } from 'ember-animatable';


const { computed, inject, run, $ } = Ember

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default Ember.Controller.extend({
  queryParams: {
    selectedBookingId: {
      as: 'bookingId'
    }
  },

  selectedBookingId: null,

  selectedBooking: computed('selectedBookingId', 'booking', function() {
    let selectedBookingId = this.get('selectedBookingId')
    if (selectedBookingId) {
      let booking = this.get('rental.bookings').findBy('id', selectedBookingId)
      if (booking) {
        return booking
      }
    }
    return this.get('booking')
  }),

  notification: inject.service('notification-messages'),

  minDate: moment().startOf('day'),
  //centering to first available day
  center: computed('disabledDates.dates', {
    get() {
      let center = moment()
      let disabledDates = this.get('disabledDates.dates')
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

  isEmailValid: computed('selectedBooking.clientEmail', function() {
    return EMAIL_REGEX.test(this.get('selectedBooking.clientEmail'))
  }),

  range: computed('selectedBooking.startAt', 'selectedBooking.endAt', {
    get() {
      let booking = this.get('selectedBooking')
      return {
        start: booking.get('startAt'),
        end: booking.get('endAt')
      }
    },
    set(key, val) {
      let { start, end } = val
      if (this.validateRange(start, end)) {
        this.get('selectedBooking').setProperties({ startAt: start, endAt: end })
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
    let bookings = this.get('bookings')
    let startAt = moment(start)
    let endAt = moment(end)
    return !bookings.any(function(booking) {
      let bookingStart = booking.get('startAt')
      let bookingEnd = booking.get('endAt')
      return (startAt.isBefore(bookingStart) || startAt.isSame(bookingStart, 'day')) && endAt.isAfter(bookingStart)
    })
  },

  bookings: computed('rental.bookings.[]', 'selectedBooking', function() {
    let selectedBooking = this.get('selectedBooking')
    return this.get('rental.bookings')
      .filter((booking)=> booking !== selectedBooking)
  }),

  // big hack
  drawCalendarItems() {
    let bookHash = this.get('disabledDates.bookHash')
    $('.ember-power-calendar-day').removeClass('full-day second-half first-half')
    for (let key in bookHash) {
      let { afterTwelve, beforeTwelve, fullDay } = bookHash[key]
        let el = $(`[data-date="${key}"]`)
        if (fullDay) {
          el.addClass('full-day')
        } else if (afterTwelve) {
          el.addClass('second-half')
        } else if (beforeTwelve) {
          el.addClass('first-half')
        }
    }
  },

  disabledDates: computed('bookings.[]', function() {
    let bookHash = {}
    let dates = this.get('bookings').reduce(function(dates, booking) {
      let startAt = booking.get('startAt')
      let endAt = booking.get('endAt')
      let date = moment(startAt)

      let startKey = date.format('YYYY-MM-DD')
      bookHash[startKey] = bookHash[startKey] || {}
      let obj1 = bookHash[startKey]
      if (obj1.beforeTwelve) {
        dates.push(date.toDate())
        bookHash[date.format('YYYY-MM-DD')] = { fullDay: true }
      } else {
        obj1.afterTwelve = true
      }

      let endKey = moment(endAt).format('YYYY-MM-DD')
      bookHash[endKey] = bookHash[endKey] || {}
      let obj2 = bookHash[endKey]
      if (obj2.afterTwelve) {
        let mDate = moment(endAt)
        dates.push(mDate.toDate())
        bookHash[mDate.format('YYYY-MM-DD')] = { fullDay: true }
      } else {
        obj2.beforeTwelve = true
      }

      date.add(1, 'day')
      while (date.isBefore(endAt)) {
        dates.push(date.toDate())
        bookHash[date.format('YYYY-MM-DD')] = { fullDay: true }
        date.add(1, 'day')
      }

      return dates
    }, []).sort((a,b)=> a - b);

    run.schedule('afterRender', this, 'drawCalendarItems') // hack

    return { dates, bookHash }
  }),

  calculatePrice() {
    let price = this.get('selectedBooking.days') * this.get('rental.dailyRate')
    this.set('selectedBooking.price', price)
  },

  actions: {

    editBooking(booking) {
      this.set('selectedBookingId', booking.get('id'))
      let { startAt, endAt } = booking.getProperties('startAt', 'endAt')
      run.next(this, function() {
        this.set('center', booking.get('startAt'))
        this.set('range', { start: startAt, end: endAt })
        this.calculatePrice()
      })
    },

    destroyBooking(booking) {
      this.set('isLoading', true)
      booking.destroyRecord()
        .then(()=> {
          this.get('notification').success('Removed Booking Successfully!')
        })
        .catch((e)=> {
          console.error(e)
          this.get('notification').error('Something Went Wrong, we are working on it')
        })
        .finally(()=> {
          this.set('isLoading', false)
        })
    },

    setRange(range) {
      this.set('range', range)
      this.calculatePrice()
      run.schedule('afterRender', this, 'drawCalendarItems') // hack
    },

    book() {
      this.set('isLoading', true)
      this.get('selectedBooking').save()
        .then(()=> {
          this.get('notification').success('Saved Successfully!')
          this.transitionToRoute('rentals')
        })
        .catch((e)=> {
          console.error(e)
          this.get('notification').error('Something Went Wrong, we are working on it')
        })
        .finally(()=> {
          this.set('isLoading', false)
        })
    },

    close() {
      this.transitionToRoute('rentals')
    }
  }

});
