sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
],
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            getUserAttributes: function() {
                const oRes = new Promise((resolve, reject) => {
                    // App router 'User API Service' https://www.npmjs.com/package/@sap/approuter#user-api-service
                    $.ajax({
                        url: "./user-api/attributes"
                    }).then(function (data, textStatus, jqXHR) {
                        resolve(data);
                    }, function (jqXHR, textStatus, errorThrown) {
                        jQuery.sap.log.error(jqXHR.responseText);
                    });
                });
                return oRes;
            },

            loadConfigModelAsync: function (component) {
                let config = component.getModel("config");
                config.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

                let ruleServiceId = config.getProperty("/ruleServiceId");

                if (ruleServiceId) {
                    // Get XSRF token:
                    // Match with route "^/business-rules-runtime/(.*)$" in xs-app.json, and API definition at [1]:
                    //  [1] https://api.sap.com/api/SAP_CF_BusinessRules_Runtime_V2/resource
                    $.ajax({
                        url: "./business-rules-runtime/rules-service/rest/v2/xsrf-token",
                        headers: { "X-CSRF-Token": "Fetch" }
                    }).then(function (data, textStatus, jqXHR) {
                        let csrfToken = jqXHR.getResponseHeader('X-CSRF-Token');

                        // JavaScript snippet from the API Business Hub:
                        var oRequestData = {
                            "RuleServiceId": ruleServiceId,
                            "RuleServiceRevision": "1",
                            "Vocabulary": [{ "InputElement": true }]
                        };

                        $.ajax({
                            //url: "./business-rules-runtime/rules-service/rest/v2/workingset-rule-services",
                            url: "./business-rules-runtime/rules-service/rest/v2/rule-services",
                            method: "POST",
                            headers: {
                                "DataServiceVersion": "2.0",
                                "Accept": "application/json",
                                "Content-Type": "application/json",
                                "x-csrf-token": csrfToken
                            },
                            data: JSON.stringify(oRequestData),
                            dataType: "json"
                        }).then(function (data, textStatus, jqXHR) {
                            jQuery.sap.log.debug("loaded configuration from business rules service");
                            //
                            if (data.Result[0]) {
                                config.setData(data.Result[0], true);
                            } else {
                                jQuery.sap.log.error(`unexpected data received: ${JSON.stringify(data)}`);
                            }
                        }, function (jqXHR, textStatus, errorThrown) {
                            jQuery.sap.log.error(jqXHR.responseText);
                        });
                    }, function (jqXHR, textStatus, errorThrown) {
                        jQuery.sap.log.error(jqXHR.responseText);
                    });
                }
            }
        };
    });