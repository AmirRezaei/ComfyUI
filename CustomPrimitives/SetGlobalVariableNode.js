import { app } from "/scripts/app.js";
import { ComfyWidgets } from '/scripts/widgets.js'
import * as ComfyApi from '/scripts/api.js'
import * as ComfyUi from '/scripts/ui.js'
import * as ComfyWorkflows from '/scripts/workflows.js'


app.registerExtension({
    name: "AR.SetGlobalVariableNode",
    registerCustomNodes() {
        class SetGlobalVariableNode {
            defaultVisibility = true;
            serialize_widgets = true;

            constructor() {
                if (graph.findNodesByType('AR.SetGlobalVariableNode').length > 0) {
                    alert('AR.SetGlobalVariableNode already exist.\nPlease remove this node.');
                    return;
                }

                // Initialize properties if not present
                if (!this.properties) {
                    this.properties = {
                        variables: []
                    };
                }
                this.properties.showOutputText = SetGlobalVariableNode.defaultVisibility;
                const node = this;

                // const globalVariableNodes = LiteGraph.graph._nodes.filter((otherNode) => otherNode.type === 'AR.GlobalVariableNode');
                // if (globalVariableNodes.length > 1) {
                //     console.log('You can not add more than one instance of this node.');
                // }
                // console.log(globalVariableNodes.length);

                // this.addWidget(
                //     "button",
                //     "Add Variable",
                //     '',
                //     () => {
                //         this.properties.variables.push({
                //             name: "New Variable",
                //             type: "string",
                //             value: "",
                //             collapsed: false
                //         });
                //         this.validateName()
                //         this.addOutput("", ""); // Add an output for the new variable
                //         this.updateWidgets();
                //     },
                //     {}
                // );

                // Method to add a new variable dynamically
                // this.addVariable = function (name, value) {
                //     this.properties.variables.push({
                //         name: name,
                //         type: typeof value,
                //         value: value,
                //         collapsed: false
                //     });
                //     this.updateWidgets();
                // };

                this.getVariable = function (name) {
                    return this.properties.variables[name];
                };

                this.getVariables = function (e) {
                    return this.properties.variables;
                };

                // Update connections
                this.onConnectionsChange = function (
                    slotType,
                    slot,
                    isChangeConnect,
                    link_info,
                    output
                ) {
                    console.log("onConnectionsChange");
                    // this.update();
                };

                // Update and render widgets
                this.updateWidgets = function () {
                    this.widgets = [];
                    this.outputs = []; // Reset outputs to update dynamically
                    this.addWidget(
                        "button",
                        "Add Variable",
                        '',
                        () => {
                            this.properties.variables.push({
                                name: "",
                                type: "string",
                                value: "",
                                collapsed: false
                            });
                            this.addOutput("", ""); // Add an output for the new variable
                            this.updateWidgets();
                        },
                        {}
                    );

                    // Add widgets for each variable
                    this.properties.variables.forEach((variable, index) => {
                        this.addWidget(
                            "toggle",
                            `Toggle ${variable.name || `Variable ${index + 1}`}`,
                            variable.collapsed,
                            (value) => {
                                this.properties.variables[index].collapsed = value;
                                this.updateWidgets();
                            },
                            {}
                        );

                        if (!variable.collapsed) {
                            this.addWidget(
                                "text",
                                `Name ${index + 1}`,
                                variable.name,
                                (value) => {
                                    this.properties.variables[index].name = value;
                                    this.validateName(this.graph, index);
                                    this.updateWidgets();
                                },
                                {}
                            );

                            this.addWidget(
                                "combo",
                                `Type ${index + 1}`,
                                variable.type,
                                (value) => {
                                    this.properties.variables[index].type = value;
                                    // this.update();
                                },
                                {
                                    values: ["int", "bool", "float", "string"]
                                }
                            );

                            this.addWidget(
                                "text",
                                `Value ${index + 1}`,
                                variable.value,
                                (value) => {
                                    this.properties.variables[index].value = value;
                                    // this.update();
                                },
                                {}
                            );

                            this.addWidget(
                                "button",
                                "Remove Variable",
                                '',
                                () => {
                                    this.properties.variables.splice(index, 1);
                                    this.updateWidgets();
                                },
                                {}
                            );

                            this.addOutput(variable.name || `Variable ${index + 1}`, ""); // Update output label with variable name
                        }
                    });
                    // this.update();
                };

                // Validate variable name to avoid conflicts
                this.validateName = function (graph, index) {
                    let widgetValue = node.properties.variables[index].name;

                    if (widgetValue !== '') {
                        let tries = 0;
                        let collisions = [];

                        do {
                            collisions = graph._nodes.filter((otherNode) => {
                                if (otherNode === this) {
                                    return false;
                                }
                                return otherNode.type === 'AR.SetGlobalVariableNode' &&
                                    otherNode.properties.variables.some((v, i) => v.name === widgetValue && i !== index);
                            });
                            if (collisions.length > 0) {
                                widgetValue = node.properties.variables[index].name + "_" + tries;
                            }
                            tries++;
                        } while (collisions.length > 0);
                        node.properties.variables[index].name = widgetValue;
                        this.updateWidgets();
                    }
                };

                // Update global variables and outputs
                // this.update = function () {
                //     console.log("SetGlobalVariableNode.update()");
                //     if (node.graph) {
                //         this.properties.variables.forEach((variable, index) => {
                //             let value = variable.value;

                //             switch (variable.type) {
                //                 case 'int':
                //                     value = parseInt(value);
                //                     break;
                //                 case 'bool':
                //                     value = value === "true";
                //                     break;
                //                 case 'float':
                //                     value = parseFloat(value);
                //                     break;
                //                 default:
                //                     value = value.toString(); // Default to string
                //                     break;
                //             }
                //             // this.SetGlobalVariableNode(variable.name, value);
                //             this.setOutputData(index, value); // Set the output data for each variable
                //         });
                //     }
                // };

                // Set global variable in the window object
                // this.setGlobalVariable = function (name, value) {
                //     window[name] = value;
                // };

                // Get global variable from the window object
                // this.getGlobalVariable = function (name) {
                //     return window[name];
                // };

                this.updateWidgets(); // Ensure all variables are rendered on initialization
                // This node is purely frontend and does not impact the resulting prompt so should not be serialized
                this.isVirtualNode = true;
            }

            onRemoved() {
                console.log("onRemove");
                console.log(this);

                // Optionally remove the global variable on node removal
                // this.properties.variables.forEach((variable) => {
                //     if (variable.name) {
                //         delete window[variable.name];
                //     }
                // });
            }
        }

        // Register the SetGlobalVariableNode with LiteGraph
        LiteGraph.registerNodeType(
            "AR.SetGlobalVariableNode",
            Object.assign(SetGlobalVariableNode, {
                title: "Set Global Variable",
            })
        );

        SetGlobalVariableNode.category = "utils";
    },
});
