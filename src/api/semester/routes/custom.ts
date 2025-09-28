/**
 * Custom routes for semester
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/semesters/student/:studentId',
      handler: 'semester.findByStudent',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/semesters/cgpa/:studentId',
      handler: 'semester.calculateCGPA',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'PUT',
      path: '/semesters/current/:studentId/:semesterId',
      handler: 'semester.setCurrentSemester',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};
