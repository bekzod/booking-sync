import moment from 'moment'
import { test } from 'qunit'
import moduleForAcceptance from 'booking-sync/tests/helpers/module-for-acceptance'

moduleForAcceptance('Acceptance | rental page')

test('visiting /rentals', function(assert) {
  server.createList('rental', 10)

  visit('/rentals')

  andThen(function() {
    assert.equal(currentURL(), '/rentals')
    assert.equal(find('.rental-item').length, 10)
  })

  click('.rental-item:eq(3)')

  let startAt = moment()
  let endAt = moment().endOf('month')

  andThen(function() {
    assert.equal(currentURL(), '/rentals/book/4')
    assert.ok(!!find('.modal-body')[0])
    fillIn('.modal-body input', 'awesome@hotmail.com')

    let format = 'YYYY-MM-DD'

    click('[data-date=' + startAt.format(format) + ']')
    click('[data-date=' + endAt.format(format) + ']')
  })

  andThen(function() {
    let days = moment(endAt).diff(startAt, 'days')
    assert.equal(find('.modal-body .days').text().trim(), days + ' days')
  })

  click('.btn.btn-primary')

  andThen(function() {
    assert.equal(currentURL(), '/rentals')
  })

})
