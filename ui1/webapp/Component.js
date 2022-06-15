sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "ovh/lkajan/blogpost/ui1/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("ovh.lkajan.blogpost.ui1.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                // Load the configuration
                models.loadConfigModelAsync(this);

                // Company code attribute(s) of logged-in user - how to obtain it?
                this.getModel().setProperty('/oLoggedinUser', {aCompanyCodes: ["How", "to", "obtain", "it?"]});
            }
        });
    }
);