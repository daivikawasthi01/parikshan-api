/**
 * semester controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::semester.semester', ({ strapi }) => ({
  
  // Get semesters for a specific student
  async findByStudent(ctx) {
    try {
      const { studentId } = ctx.params;
      
      if (!studentId) {
        return ctx.badRequest('Student ID is required');
      }

      const semesters = await strapi.entityService.findMany('api::semester.semester', {
        filters: {
          student: {
            id: studentId
          }
        },
        sort: [{ semesterNumber: 'asc' }, { academicYear: 'asc' }],
        populate: ['student']
      });

      return ctx.send({
        success: true,
        data: semesters
      });

    } catch (error) {
      console.error('Error finding semesters by student:', error);
      return ctx.internalServerError('Error retrieving semesters');
    }
  },

  // Calculate overall CGPA for a student
  async calculateCGPA(ctx) {
    try {
      const { studentId } = ctx.params;
      
      if (!studentId) {
        return ctx.badRequest('Student ID is required');
      }

      const semesters = await strapi.entityService.findMany('api::semester.semester', {
        filters: {
          student: {
            id: studentId
          },
          status: 'Completed'
        }
      });

      let totalGradePoints = 0;
      let totalCredits = 0;
      
      for (const semester of semesters as any[]) {
        if (semester.GPA && semester.credits) {
          totalGradePoints += semester.GPA * semester.credits;
          totalCredits += semester.credits;
        }
      }

      const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;

      return ctx.send({
        success: true,
        data: {
          cgpa: parseFloat(cgpa.toFixed(2)),
          totalCredits,
          completedSemesters: semesters.length
        }
      });

    } catch (error) {
      console.error('Error calculating CGPA:', error);
      return ctx.internalServerError('Error calculating CGPA');
    }
  },

  // Set current semester for a student
  async setCurrentSemester(ctx) {
    try {
      const { studentId, semesterId } = ctx.params;
      
      if (!studentId || !semesterId) {
        return ctx.badRequest('Student ID and Semester ID are required');
      }

      // First, unset current semester for all semesters of this student
      const studentSemesters = await strapi.entityService.findMany('api::semester.semester', {
        filters: {
          student: {
            id: studentId
          }
        }
      });

      // Update all semesters to not be current
      for (const semester of studentSemesters as any[]) {
        if (semester.isCurrentSemester) {
          await strapi.entityService.update('api::semester.semester', semester.id, {
            data: { isCurrentSemester: false }
          });
        }
      }

      // Set the specified semester as current
      const updatedSemester = await strapi.entityService.update('api::semester.semester', semesterId, {
        data: { isCurrentSemester: true },
        populate: ['student']
      });

      return ctx.send({
        success: true,
        message: 'Current semester updated successfully',
        data: updatedSemester
      });

    } catch (error) {
      console.error('Error setting current semester:', error);
      return ctx.internalServerError('Error setting current semester');
    }
  }

}));
