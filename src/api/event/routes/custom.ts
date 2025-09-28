export default {
  routes: [
    {
      method: 'POST',
      path: '/events/:eventId/register',
      handler: 'event.register',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/events/:eventId/attend',
      handler: 'event.attend',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};