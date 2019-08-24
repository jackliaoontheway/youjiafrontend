import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { TableDialogComponent } from 'app/model-view/component/table-dialog.component';
import { ModelService } from 'app/service/model.service';
import { TranslateService } from '@ngx-translate/core';
import { BaseModel } from 'app/model/base.model';
/**
* Node for to-do item
*/
export class TodoItemNode {
    children: TodoItemNode[];
    id: number;
    item: string;
    selected: boolean;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
    id: number;
    item: string;
    level: number;
    expandable: boolean;
    selected: boolean;
    userRoleId: number;
}

@Component({
    selector: 'app-grant-functionality-to-userrole',
    templateUrl: './grant-functionality-to-userrole.component.html',
    styleUrls: ['./grant-functionality-to-userrole.component.scss']
})
export class GrantFunctionalityToUserroleComponent implements OnInit {

    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

    /** A selected parent node to be inserted */
    selectedParent: TodoItemFlatNode | null = null;

    /** The new item's name */
    newItemName = '';

    treeControl: FlatTreeControl<TodoItemFlatNode>;

    treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

    dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

    /** The selection for checklist */
    checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

    userRoleId: number;
    serviceUrl: string;
    modelTitle: string;
    matDialogRef: MatDialogRef<TableDialogComponent>;

    buildTreeItems(functionality: any): TodoItemNode {
        const node = new TodoItemNode();
        node.id = functionality.id;
        node.item = functionality.label;
        node.selected = functionality.selected;
        if (functionality.subMenus && functionality.subMenus.length > 0) {
            const subNodes = new Array();
            for (let i = 0; i < functionality.subMenus.length; i++) {
                subNodes.push(this.buildTreeItems(functionality.subMenus[i]));
            }
            node.children = subNodes;
        }
        return node;
    }

    ngOnInit(): void {
        const requestData = new BaseModel();
        requestData.id = this.userRoleId;
        this.modelService.fetchEntitiesByCriteria('/useraccountroles/', 'fetchFunctionalitiesByUserRole', requestData)
            .then(responseData => {
                if (responseData) {
                    const allFunctionalities = new Array();
                    for (let i = 0; i < responseData.length; i++) {
                        allFunctionalities.push(this.buildTreeItems(responseData[i]));
                    }
                    this.dataSource.data = allFunctionalities;
                }
            });
    }



    constructor(private matDialogRef_: MatDialogRef<TableDialogComponent>,
        private translate: TranslateService, private modelService: ModelService,
        @Inject(MAT_DIALOG_DATA) private requestData: any, public snackBar: MatSnackBar) {

        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.matDialogRef = matDialogRef_;
        this.modelTitle = requestData.modelTitle;
        this.serviceUrl = requestData.serviceUrl;
        this.userRoleId = requestData.userRoleId;
    }

    getLevel = (node: TodoItemFlatNode) => node.level;

    isExpandable = (node: TodoItemFlatNode) => node.expandable;

    getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

    hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

    hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    transformer = (node: TodoItemNode, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.id === node.id
            ? existingNode
            : new TodoItemFlatNode();
        flatNode.item = node.item;
        flatNode.id = node.id;
        flatNode.level = level;
        flatNode.selected = node.selected;
        flatNode.expandable = !!node.children;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);

        if (flatNode.selected) {
            this.checklistSelection.select(flatNode);
        }

        return flatNode;
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: TodoItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.every(child =>
            this.checklistSelection.isSelected(child)
        );
        return descAllSelected;
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.checklistSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }

    /** Toggle the to-do item selection. Select/deselect all the descendants node */
    todoItemSelectionToggle(node: TodoItemFlatNode): void {
        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        this.checklistSelection.isSelected(node)
            ? this.checklistSelection.select(...descendants)
            : this.checklistSelection.deselect(...descendants);

        // Force update for the parent
        descendants.every(child =>
            this.checklistSelection.isSelected(child)
        );
        const nodeIsSelected = this.checklistSelection.isSelected(node);
        if (nodeIsSelected) {
            this.checkAllParentsSelection(node);
        }

        this.grantFunctionalityForUserRole(node, descendants, nodeIsSelected);
    }

    grantFunctionalityForUserRole(parentNode: TodoItemFlatNode, children: TodoItemFlatNode[], selected: boolean): void {
        const list = new Array();
        parentNode.userRoleId = this.userRoleId;
        parentNode.selected = selected;
        list.push(parentNode);
        if (children && children.length > 0) {
            for (let i = 0; i < children.length; i++) {
                children[i].userRoleId = this.userRoleId;
                children[i].selected = selected;
                list.push(children[i]);
            }
        }

        this.modelService.saveEntitiesByCriteria('/useraccountroles/', 'grantFunctionalityForUserRole', list).then(responseData => {
            if (!responseData) {
                // 提示消息
            }
        });
    }

    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
        this.checklistSelection.toggle(node);
        const nodeIsSelected = this.checklistSelection.isSelected(node);
        let parents = null;
        if (nodeIsSelected) {
            this.checkAllParentsSelection(node);
            parents = new Array();
            let parent: TodoItemFlatNode | null = this.getParentNode(node);
            while (parent) {
                parents.push(parent);
                parent = this.getParentNode(parent);
            }
        }

        this.grantFunctionalityForUserRole(node, parents, nodeIsSelected);
    }

    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: TodoItemFlatNode): void {
        let parent: TodoItemFlatNode | null = this.getParentNode(node);
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = this.getParentNode(parent);
        }
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: TodoItemFlatNode): void {
        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.every(child =>
            this.checklistSelection.isSelected(child)
        );

        const result = descendants.some(child => this.checklistSelection.isSelected(child));

        /*if (nodeSelected && !descAllSelected) {
          this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
          this.checklistSelection.select(node);
        }*/
        if (result) {
            this.checklistSelection.select(node);
        } else if (nodeSelected && !descAllSelected) {
            this.checklistSelection.deselect(node);
        }
    }

    /* Get the parent node of a node */
    getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }
}
