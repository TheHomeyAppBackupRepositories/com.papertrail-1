"use strict";

module.exports = {
  /**
   * Receives log messages and forwards them to Papertrail.
   */
  async logMessage({ homey, body }) {
    try {
      const { pri, appName, message } = body;

      // Log the incoming request body for debugging
      console.log(
        `Received request to log message: PRI=${pri}, appName=${appName}, message=${message}`
      );

      // Get Papertrail instance from the app
      const papertrail = homey.app.getPapertrailInstance();

      if (!papertrail) {
        throw new Error("Papertrail instance not initialized.");
      }

      // Default PRI to 14 if not provided
      const priority = typeof pri !== "undefined" ? parseInt(pri) : 14;

      // Send log message using Papertrail instance
      papertrail.sendLogMessage(priority, appName, message);

      return { status: "Log sent to Papertrail" };
    } catch (error) {
      // Log the error for debugging
      console.error("Error in logMessage API:", error);
      throw new Error("Internal Server Error");
    }
  },
};
