import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::university.university",
  ({ strapi }) => ({

    // Add notification IPFS hash to university
    async addNotification(ctx) {
      try {
        const userId = ctx.state.user?.id;
        const { universityId } = ctx.params;
        
        if (!userId) {
          return ctx.unauthorized("Authentication required");
        }

        // Get user with university relationship
        const user: any = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          userId,
          {
            populate: ["role", "university"],
          }
        );

        // Verify user is University Admin and belongs to this university
        if (!user || user.role?.name !== "University Admin") {
          return ctx.forbidden("Only University Admin can add notifications");
        }

        if (!user.university || user.university.id.toString() !== universityId) {
          return ctx.forbidden("You can only add notifications to your own university");
        }

        const { ipfsHash, title, category, priority } = ctx.request.body;

        // Validate required fields
        if (!ipfsHash || !title) {
          return ctx.badRequest("IPFS hash and title are required");
        }

        // Get current university data
        const university = await strapi.entityService.findOne(
          "api::university.university",
          universityId
        ) as any;

        if (!university) {
          return ctx.notFound("University not found");
        }

        // Get current notification hashes or initialize empty array
        const currentHashes = university.notificationHashes || [];

        // Create notification object
        const notificationData = {
          ipfsHash,
          title,
          category: category || "General",
          priority: priority || "Normal",
          createdAt: new Date().toISOString(),
          createdBy: user.email
        };

        // Check if IPFS hash already exists
        const existingNotification = currentHashes.find(
          (notif: any) => notif.ipfsHash === ipfsHash
        );

        if (existingNotification) {
          return ctx.badRequest("Notification with this IPFS hash already exists");
        }

        // Add new notification to the list
        const updatedHashes = [...currentHashes, notificationData];

        // Update university with new notification list
        const updatedUniversity = await strapi.entityService.update(
          "api::university.university",
          universityId,
          {
            data: {
              notificationHashes: updatedHashes
            }
          }
        );

        return ctx.send({
          success: true,
          message: "Notification added successfully",
          data: {
            university: updatedUniversity,
            addedNotification: notificationData
          }
        });

      } catch (error) {
        console.error('Add notification error:', error);
        return ctx.internalServerError("Error adding notification");
      }
    },

    // Get all notifications for a university
    async getNotifications(ctx) {
      try {
        const { universityId } = ctx.params;
        const { category, priority, active = true } = ctx.query;

        if (!universityId) {
          return ctx.badRequest("University ID is required");
        }

        // Get university with notifications
        const university = await strapi.entityService.findOne(
          "api::university.university",
          universityId
        ) as any;

        if (!university) {
          return ctx.notFound("University not found");
        }

        let notifications = university.notificationHashes || [];

        // Apply filters if provided
        if (category) {
          notifications = notifications.filter((notif: any) => notif.category === category);
        }

        if (priority) {
          notifications = notifications.filter((notif: any) => notif.priority === priority);
        }

        // Sort by creation date (newest first)
        notifications.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return ctx.send({
          success: true,
          data: {
            university: {
              id: university.id,
              name: university.name
            },
            notifications,
            total: notifications.length
          }
        });

      } catch (error) {
        console.error('Get notifications error:', error);
        return ctx.internalServerError("Error retrieving notifications");
      }
    },

    // Remove notification by IPFS hash
    async removeNotification(ctx) {
      try {
        const userId = ctx.state.user?.id;
        const { universityId, ipfsHash } = ctx.params;
        
        if (!userId) {
          return ctx.unauthorized("Authentication required");
        }

        // Get user with university relationship
        const user: any = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          userId,
          {
            populate: ["role", "university"],
          }
        );

        // Verify user is University Admin and belongs to this university
        if (!user || user.role?.name !== "University Admin") {
          return ctx.forbidden("Only University Admin can remove notifications");
        }

        if (!user.university || user.university.id.toString() !== universityId) {
          return ctx.forbidden("You can only remove notifications from your own university");
        }

        if (!ipfsHash) {
          return ctx.badRequest("IPFS hash is required");
        }

        // Get current university data
        const university = await strapi.entityService.findOne(
          "api::university.university",
          universityId
        ) as any;

        if (!university) {
          return ctx.notFound("University not found");
        }

        // Get current notification hashes
        const currentHashes = university.notificationHashes || [];

        // Find and remove the notification
        const updatedHashes = currentHashes.filter(
          (notif: any) => notif.ipfsHash !== ipfsHash
        );

        if (currentHashes.length === updatedHashes.length) {
          return ctx.notFound("Notification with this IPFS hash not found");
        }

        // Update university with filtered notification list
        const updatedUniversity = await strapi.entityService.update(
          "api::university.university",
          universityId,
          {
            data: {
              notificationHashes: updatedHashes
            }
          }
        );

        return ctx.send({
          success: true,
          message: "Notification removed successfully",
          data: {
            university: updatedUniversity,
            removedIpfsHash: ipfsHash
          }
        });

      } catch (error) {
        console.error('Remove notification error:', error);
        return ctx.internalServerError("Error removing notification");
      }
    },

    // Get notification by IPFS hash
    async getNotificationByHash(ctx) {
      try {
        const { universityId, ipfsHash } = ctx.params;

        if (!universityId || !ipfsHash) {
          return ctx.badRequest("University ID and IPFS hash are required");
        }

        // Get university with notifications
        const university = await strapi.entityService.findOne(
          "api::university.university",
          universityId
        ) as any;

        if (!university) {
          return ctx.notFound("University not found");
        }

        const notifications = university.notificationHashes || [];
        const notification = notifications.find((notif: any) => notif.ipfsHash === ipfsHash);

        if (!notification) {
          return ctx.notFound("Notification not found");
        }

        return ctx.send({
          success: true,
          data: {
            university: {
              id: university.id,
              name: university.name
            },
            notification
          }
        });

      } catch (error) {
        console.error('Get notification by hash error:', error);
        return ctx.internalServerError("Error retrieving notification");
      }
    }
  })
);
