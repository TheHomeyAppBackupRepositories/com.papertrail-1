"use strict";

const Homey = require("homey");
const Papertrail = require("./lib/papertrail");

class MyApp extends Homey.App {
  onInit() {
    this.log("Initializing the app");

    // Initialize Papertrail if host and port are set
    this.initializePapertrail();

    // Register the Flow action card
    const sendLogToPapertrailAction = this.homey.flow.getActionCard(
      "send_log_to_papertrail"
    );

    sendLogToPapertrailAction.registerRunListener(async (args, state) => {
      let { program, message } = args;

      // Set default value "Blank" if program or message is not provided
      program = program ? program : "Blank";
      message = message ? message : "Blank";

      // Get Papertrail instance and send the log
      const papertrail = this.getPapertrailInstance();
      if (papertrail) {
        papertrail.sendLogMessage(program, message);
        return Promise.resolve(true);
      } else {
        this.log("Papertrail instance is not available");
        return Promise.reject(
          new Error("Papertrail instance is not available")
        );
      }
    });
    
    // Listen for changes in the settings and reinitialize Papertrail when updated
    this.homey.settings.on("set", (key) => {
      if (key === "host" || key === "port") {
        this.log(`Settings updated for ${key}, reinitializing Papertrail...`);
        this.initializePapertrail();
      }
    });
  }

  // Method to expose the Papertrail instance to api.js
  getPapertrailInstance() {
    return this.papertrail;
  }

  /**
   * Initializes Papertrail if the host and port are configured in settings.
   */
  initializePapertrail() {
    const host = this.homey.settings.get("host");
    const port = this.homey.settings.get("port");

    if (host && port) {
      this.papertrail = new Papertrail(this.homey); // Store Papertrail instance in `this.papertrail`
      // Send a log message from the app
      this.papertrail.sendLogMessage(
        this.manifest.id,
        "App started successfully!"
      );
    } else {
      this.log("Papertrail logging is not configured.");
    }
  }
}

module.exports = MyApp;
