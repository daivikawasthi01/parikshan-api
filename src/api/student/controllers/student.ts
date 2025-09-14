import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::student.student",
  ({ strapi }) => ({
    // Create student with user account
    async createWithUser(ctx) {
      try {
        // Get user with populated university relationship
        const userId = ctx.state.user.id;
        const user: any = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          userId,
          {
            populate: ["role", "university"],
            publicationState: "preview", // This includes draft content
          }
        );

        

        // Verify user is University Admin
        if (!user || user.role?.name !== "University Admin") {
          return ctx.badRequest("Only University Admin can create students");
        }

        // Check if university relationship exists and has an id
        if (!user.university || !user.university.id) {
          return ctx.badRequest(
            "University Admin must be associated with a university"
          );
        }

        const universityId = user.university.id;

        const {
          email,
          password,
          department,
          year,
          semester,
          CGPA,
          phoneNumber,
          enrollmentDate,
          expectedGraduation,
          address,
        } = ctx.request.body;

        // Validate required fields
        if (!email || !password) {
          return ctx.badRequest("Email and password are required");
        }

        // Get Student role
        const studentRole = await strapi
          .query("plugin::users-permissions.role")
          .findOne({
            where: { name: "Student" },
          });

        if (!studentRole) {
          return ctx.badRequest("Student role not found");
        }

        // Check if user already exists
        const existingUser = await strapi
          .query("plugin::users-permissions.user")
          .findOne({
            where: { email },
          });

        if (existingUser) {
          return ctx.badRequest("User with this email already exists");
        }

        /// use random username based on email and random number to avoid duplicates
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

        // Create user account using Strapi's user service (properly hashes password)
        const newUser = await strapi.plugins['users-permissions'].services.user.add({
          username,
          email,
          password, // This will be automatically hashed by Strapi
          role: studentRole.id,
          confirmed: true,
          blocked: false,
          provider: 'local'
        });

        // Create student profile linked to the user and university
        const studentData = {
          users_permissions_user: newUser.id,
          university: universityId,
          studentId: username, // or generate a unique studentId if needed
          ...(department && { department }),
          ...(year && { year }),
          ...(semester && { semester }),
          ...(CGPA && { CGPA }),
          ...(phoneNumber && { phoneNumber }),
          ...(enrollmentDate && { enrollmentDate }),
          ...(expectedGraduation && { expectedGraduation }),
          ...(address && { address }),
        };

        const newStudent = await strapi.entityService.create(
          "api::student.student",
          {
            data: studentData,
            populate: ["users_permissions_user", "university"],
          }
        );

        return ctx.send({
          success: true,
          message: "Student created successfully",
          data: {
            user: {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              confirmed: true,
              blocked: false,
              provider: "local",
            },
            student: newStudent,
          },
        });
      } catch (error) {
        return ctx.internalServerError(
          "Something went wrong during student creation"
        );
      }
    },
  })
);
