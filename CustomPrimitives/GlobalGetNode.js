import { app } from "/scripts/app.js";
import { ComfyWidgets } from '/scripts/widgets.js'

app.registerExtension({
    name: "AR.GetGlobalVariableNode",
    registerCustomNodes() {
        class GetGlobalVariableNode {
            defaultVisibility = true;
            serialize_widgets = true;

            constructor() {
                // Initialize properties if not present
                if (!this.properties) {
                    this.properties = {
                        selectedVariable: ""
                    };
                }
                this.properties.showOutputText = GetGlobalVariableNode.defaultVisibility;

                const node = this;

                // Add a combo box to select a variable
                this.addWidget(
                    "combo",
                    "Variable",
                    "",
                    (value) => {
                        this.properties.selectedVariable = value;
                        this.updateHeader();
                        this.update();
                    },
                    {
                        values: () => {
                            // Get all GlobalVariableNode instances in the graph
                            const globalVariableNodes = node.graph._nodes.filter((otherNode) => otherNode.type === 'AR.GlobalVariableNode');
                            return globalVariableNodes.flatMap((gvNode) => gvNode.properties.variables.map((v) => v.name)).sort();
                        }
                    }
                );

                this.addOutput("*", "*");

                // Update connections
                this.onConnectionsChange = function (
                    slotType, //0 = output, 1 = input
                    slot,
                    isChangeConnect,
                    link_info,
                    output
                ) {
                    console.log("GetGlobalVariableNode.onConnectionsChange");
                    this.update();
                };

                // Update the node's data and header
                this.update = function () {
                    console.log("GetGlobalVariableNode.update()");
                    const selectedVariableName = this.properties.selectedVariable;
                    const variableValue = this.getGlobalVariable(selectedVariableName);
                    this.setOutputData(0, variableValue);
                    this.updateHeader();
                    console.log('variableValue', variableValue);
                };

                // Update the node's header
                this.updateHeader = function () {
                    const selectedVariableName = this.properties.selectedVariable;
                    this.title = selectedVariableName || "Global Get";
                };

                // Get global variable from the window object
                // this.getGlobalVariable = function (name) {
                //     return window[name];
                // };

                this.updateHeader();
                // This node is purely frontend and does not impact the resulting prompt so should not be serialized
                this.isVirtualNode = true;
            }
        }

        // Register the GetGlobalVariableNode with LiteGraph
        LiteGraph.registerNodeType(
            "AR.GetGlobalVariableNode",
            Object.assign(GetGlobalVariableNode, {
                title: "Get Global Variable",
            })
        );

        GetGlobalVariableNode.category = "utils";
    },
});
