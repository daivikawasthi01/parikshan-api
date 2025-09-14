// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap: async ({ strapi }: { strapi: any }) => {
    console.log('🚀 Bootstrap: Checking user relationships and data integrity...');
    
    // Validate user relationships and data consistency
    try {
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        populate: ['role', 'university', 'student']
      });
      
      let adminCount = 0;
      let studentCount = 0;
      let adminsWithUniversity = 0;
      let studentsWithProfile = 0;
      
      for (const user of users) {
        const roleName = user.role?.name;
        
        if (roleName === 'University Admin') {
          adminCount++;
          if (user.university) {
            adminsWithUniversity++;
          } else {
            console.warn(`⚠️ University Admin user ${user.email} is not assigned to any university`);
          }
        }
        
        if (roleName === 'Student') {
          studentCount++;
          if (user.student) {
            studentsWithProfile++;
          } else {
            console.warn(`⚠️ Student user ${user.email} is missing student profile`);
          }
        }
      }
      
      console.log(`📊 Bootstrap Summary:`);
      console.log(`   - Total users: ${users.length}`);
      console.log(`   - University Admins: ${adminCount} (${adminsWithUniversity} with university)`);
      console.log(`   - Students: ${studentCount} (${studentsWithProfile} with profiles)`);
      console.log('✅ Bootstrap: User relationship validation complete');
      
    } catch (error) {
      console.log('ℹ️ Bootstrap: Skipping validation (database may not be ready yet)');
      console.log(`   Error: ${error.message}`);
    }
  },
};
