/**
 * event controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::event.event", ({ strapi }) => ({
  // Student registers for an event
  async register(ctx) {
    const { eventId } = ctx.params;
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("Authentication required");
    }

    // Find student profile for user
    const students = await strapi.entityService.findMany("api::student.student", {
      filters: { users_permissions_user: userId },
    });
    const student = students[0];
    if (!student) {
      return ctx.forbidden("Only students can register for events");
    }

    // Find event
    const event:any = await strapi.entityService.findOne("api::event.event", eventId, {
      populate: ["Registered"],
    });
    if (!event) {
      return ctx.notFound("Event not found");
    }

    // Check if already registered
    const alreadyRegistered:any = event.Registered?.some((s) => s.id === student.id);
    if (alreadyRegistered) {
      return ctx.badRequest("Already registered for this event");
    }

    // Add student to Registered
    const updatedRegistered:any = [...(event.Registered?.map((s) => s.id) || []), student.id];
    await strapi.entityService.update("api::event.event", eventId, {
      data: {
        Registered: updatedRegistered,
      },
    });

    return ctx.send({ success: true, message: "Registered for event" });
  },

  // Student attends an event (only if registered)
  async attend(ctx) {
    const { eventId } = ctx.params;
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("Authentication required");
    }

    // Find student profile for user
    const students = await strapi.entityService.findMany("api::student.student", {
      filters: { users_permissions_user: userId },
    });
    const student = students[0];
    if (!student) {
      return ctx.forbidden("Only students can attend events");
    }

    // Find event
    const event:any = await strapi.entityService.findOne("api::event.event", eventId, {
      populate: ["Registered", "Attendees"],
    });
    if (!event) {
      return ctx.notFound("Event not found");
    }

    // Check if registered
    const isRegistered = event.Registered?.some((s) => s.id === student.id);
    if (!isRegistered) {
      return ctx.forbidden("You must register before attending this event");
    }

    // Check if already marked as attended
    const alreadyAttended = event.Attendees?.some((s) => s.id === student.id);
    if (alreadyAttended) {
      return ctx.badRequest("Already marked as attended");
    }

    // Add student to Attendees
    const updatedAttendees:any = [...(event.Attendees?.map((s) => s.id) || []), student.id];
    await strapi.entityService.update("api::event.event", eventId, {
      data: {
        Attendees: updatedAttendees,
      },
    });

    return ctx.send({ success: true, message: "Attendance marked for event" });
  },
}));