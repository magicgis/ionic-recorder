import {Page, NavParams, ViewController} from "ionic-angular";
import {Control, FormBuilder, ControlGroup, Validators} from "angular2/common";
import {TreeNode} from "../../providers/local-db/local-db";


interface ValidationResult {
    [key: string]: boolean;
}

@Page({
    templateUrl: "build/pages/add-folder/add-folder.html"
})
export class AddFolderPage {
    private nameControl: Control;
    private parentPath: string;
    private form: ControlGroup;

    constructor(
        private navParams: NavParams,
        private viewController: ViewController,
        private formBuilder: FormBuilder
    ) {
        // passed in a string with the parent path in it
        this.parentPath = navParams.data.parentPath;

        let hasSlash = (control: Control): ValidationResult => {
            console.log("HS validator control.value: " + control.value);
            if (control.value !== "" && control.value.indexOf("/") !== -1) {
                return { hasSlash: true };
            }
            return null;
        };

        let alreadyExists = (control: Control): ValidationResult => {
            console.log("AE validator: " +
                this.navParams.data.parentItems[0].name);
            if (control.value !== "" &&
                this.navParams.data.parentItems.filter(
                    (node: TreeNode) => {
                        return control.value === node.name;
                    }).length > 0) {
                return { "alreadyExists": true };
            }
            return null;
        };

        this.nameControl = new Control(
            "",
            Validators.compose([
                Validators.required,
                alreadyExists,
                hasSlash
            ]));

        this.form = formBuilder.group({
            nameControl: this.nameControl
        });
    }

    onClickCancel() {
        console.log("onClickCancel()");
        this.viewController.dismiss("");
    }

    onClickAdd() {
        console.log("onClickAdd()");
        let result: string = this.form.value.nameControl;
        // trim the result
        result = result.replace(/^\s+|\s+$/g, "");
        this.viewController.dismiss(result);
    }

}