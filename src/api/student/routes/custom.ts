/**
 * Custom routes for student
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/students/create-with-user',
      handler: 'student.createWithUser',
      config: {
        policies: [],
        middlewares: []
      }
    },
  ]
};
