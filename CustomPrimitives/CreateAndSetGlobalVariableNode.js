import { app } from "/scripts/app.js";
import { ComfyWidgets } from '/scripts/widgets.js'

app.registerExtension({
    name: "AR.CreateAndSetGlobalVariableNode",
    registerCustomNodes() {
        class CreateAndSetGlobalVariableNode {
            defaultVisibility = true;
            serialize_widgets = true;

            constructor() {
                // Initialize properties if not present
                if (!this.properties) {
                    this.properties = {
                        variableName: "",
                        variableValue: ""
                    };
                }
                this.properties.showOutputText = CreateAndSetGlobalVariableNode.defaultVisibility;

                // Add input and output slots
                this.addInput("input", "*");

                const node = this;

                // Update connections
                this.onConnectionsChange = function (slotType, slot, isChangeConnect, link_info, output) {
                    console.log("onConnectionsChange");
                    this.update();
                };

                // Update node header and set global variable
                this.update = function () {
                    console.log("CreateAndSetGlobalVariableNode.update()");
                    const inputLink = this.inputs[0].link;
                    if (inputLink != null) {
                        const inputNode = this.graph.getNodeById(this.graph.links[inputLink].origin_id);
                        if (inputNode) {
                            const connectedOutputSlot = this.graph.links[inputLink].origin_slot;
                            const connectedVariableName = inputNode.outputs[connectedOutputSlot].name;

                            if (connectedVariableName) {
                                this.properties.variableName = connectedVariableName;
                                const inputValue = inputNode.getOutputData(connectedOutputSlot);

                                this.properties.variableValue = inputValue;
                                this.setGlobalVariable(connectedVariableName, inputValue);
                                this.title = connectedVariableName;

                                // Add the variable to GlobalVariableNode
                                const globalVariableNodes = this.graph._nodes.filter(node => node.type === "AR.GlobalVariableNode");
                                if (globalVariableNodes.length > 0) {
                                    const globalVariableNode = globalVariableNodes[0];
                                    globalVariableNode.addVariable(connectedVariableName, inputValue);
                                }
                            }
                        }
                    }
                };

                // Set global variable in the window object
                this.setGlobalVariable = function (name, value) {
                    window[name] = value;
                };

                // Get global variable from the window object
                this.getGlobalVariable = function (name) {
                    return window[name];
                };

                // This node is purely frontend and does not impact the resulting prompt so should not be serialized
                this.isVirtualNode = true;
            }
        }

        // Register the CreateAndSetGlobalVariableNode with LiteGraph
        LiteGraph.registerNodeType(
            "AR.CreateAndSetGlobalVariableNode",
            Object.assign(CreateAndSetGlobalVariableNode, {
                title: "Create and Set Global Variable",
            })
        );

        CreateAndSetGlobalVariableNode.category = "utils";
    },
});