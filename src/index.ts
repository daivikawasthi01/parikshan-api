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
      let conflictingUsers = 0;
      let invalidRelationships = [];
      
      for (const user of users) {
        const roleName = user.role?.name;
        const hasStudent = !!user.student;
        const hasUniversity = !!user.university;
        
        // Check for conflicts
        if (hasStudent && hasUniversity) {
          conflictingUsers++;
          invalidRelationships.push({
            userId: user.id,
            email: user.email,
            issue: 'User has both student and university relationships',
            role: roleName
          });
        }
        
        // Role-relationship mismatches
        if (roleName === 'Student' && hasUniversity) {
          invalidRelationships.push({
            userId: user.id,
            email: user.email,
            issue: 'Student role with university relationship',
            role: roleName
          });
        }
        
        if (roleName === 'University Admin' && hasStudent) {
          invalidRelationships.push({
            userId: user.id,
            email: user.email,
            issue: 'University Admin role with student profile',
            role: roleName
          });
        }
        
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
      
      if (invalidRelationships.length > 0) {
        console.warn(`⚠️ Found ${invalidRelationships.length} users with invalid relationships:`);
        invalidRelationships.forEach(issue => {
          console.warn(`   - User ${issue.email} (ID: ${issue.userId}): ${issue.issue}`);
        });
        console.warn(`   💡 Use the admin panel or API to fix these relationships`);
      } else {
        console.log('✅ All user relationships are valid');
      }
      
      if (conflictingUsers > 0) {
        console.error(`❌ CRITICAL: ${conflictingUsers} users have conflicting relationships (both student and university)`);
        console.error(`   These users MUST be fixed before the system can function properly!`);
      }
      
      console.log('✅ Bootstrap: User relationship validation complete');
      
    } catch (error) {
      console.log('ℹ️ Bootstrap: Skipping validation (database may not be ready yet)');
      console.log(`   Error: ${error.message}`);
    }
  },
};
