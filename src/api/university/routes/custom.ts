/**
 * Custom routes for university
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/universities/:universityId/notifications',
      handler: 'university.addNotification',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/universities/:universityId/notifications',
      handler: 'university.getNotifications',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'DELETE',
      path: '/universities/:universityId/notifications/:ipfsHash',
      handler: 'university.removeNotification',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/universities/:universityId/notifications/:ipfsHash',
      handler: 'university.getNotificationByHash',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};
