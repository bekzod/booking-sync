export default function() {
  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing
  this.namespace = '/api';
  this.get('/rentals');
  this.post('/rentals');
  this.get('/rentals/:id');
  this.del('/rentals/:id');

  this.get('/bookings');
  this.post('/bookings');
  this.get('/bookings/:id');
  this.del('/bookings/:id');
}
