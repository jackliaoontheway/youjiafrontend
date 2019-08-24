import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ModelService } from 'app/service/model.service';

export class FileNode {
  id: number;
  children: FileNode[];
  filename: string;
  type: any;
}

@Component({
  selector: 'app-usergroup-management',
  templateUrl: './usergroup-management.component.html',
  styleUrls: ['./usergroup-management.component.scss']
})
export class UsergroupManagementComponent implements OnInit {

  nestedTreeControl: NestedTreeControl<FileNode>;
  nestedDataSource: MatTreeNestedDataSource<FileNode>;

  constructor(private modelService: ModelService) {
    this.nestedTreeControl = new NestedTreeControl<FileNode>(this._getChildren);
    this.nestedDataSource = new MatTreeNestedDataSource();
  }

  buildTreeItems(userGroup: any): FileNode {
    const node = new FileNode();
    node.id = userGroup.id;
    node.filename = userGroup.label;
    node.type = !userGroup.groupType;
    if (userGroup.subGroups && userGroup.subGroups.length > 0) {
      const subNodes = new Array();
      for (let i = 0; i < userGroup.subGroups.length; i++) {
        subNodes.push(this.buildTreeItems(userGroup.subGroups[i]));
      }
      node.children = subNodes;
    }
    return node;
  }

  ngOnInit(): void {
    this.modelService.fetchEntitiesByCriteria('/divisiongroups/', 'fetchDivisionGroups', null)
      .then(responseData => {
        if (responseData) {
          const allUserGroups = new Array();
          for (let i = 0; i < responseData.length; i++) {
            allUserGroups.push(this.buildTreeItems(responseData[i]));
          }
          this.nestedDataSource.data = allUserGroups;
        }
      });
  }
  hasNestedChild = (_: number, nodeData: FileNode) => !nodeData.type;

  private _getChildren = (node: FileNode) => node.children;
}
