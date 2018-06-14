/*
 * Copyright (c) 2012-2018 Red Hat, Inc.
 * This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which is available at http://www.eclipse.org/legal/epl-2.0.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

import { injectable, inject } from 'inversify';
import { CompositeTreeNode, TreeNode, SelectableTreeNode, ExpandableTreeNode } from '@theia/core/lib/browser';
import { LanguageClientProvider } from '@theia/languages/lib/browser/language-client-provider';
import { ExecuteCommandRequest } from 'monaco-languageclient/lib';
import { ILanguageClient } from '@theia/languages/lib/common';
import { GET_EXTERNAL_LIBRARIES_COMMAND, GET_LIBRARY_CHILDREN_COMMAND, GET_EXTERNAL_LIBRARIES_CHILDREN_COMMAND } from '../che-ls-jdt-commands';
import { FileNavigatorTree } from '@theia/navigator/lib/browser/navigator-tree';

@injectable()
export class ExternalLibrariesTree extends FileNavigatorTree {

    @inject(LanguageClientProvider)
    protected readonly languageClientProvider!: LanguageClientProvider;

    async resolveChildren(parent: CompositeTreeNode): Promise<TreeNode[]> {

        if (!parent.parent) {
            return super.resolveChildren(parent).then((nodes) => {
                let isJavaProject = nodes.filter(node => node.id.endsWith("pom.xml") || node.id.endsWith(".gradle")).length >= 1;
                if (isJavaProject) {
                    const libNode = LibraryNode.create(parent.id, parent);
                    super.addNode(libNode);
                    return nodes.concat([libNode]);
                }
                return nodes;
            });
            
        }

        if(isJavaNode(parent) && !JarFileNode.is(parent)) {
            const javaClient = await this.languageClientProvider.getLanguageClient("java");

            if(!javaClient) {
                return Promise.resolve([]);
            }

            if (LibraryNode.is(parent)) {
                return LibraryNode.doRequest(parent, javaClient);
            } else if (JarNode.is(parent)) {
                return JarNode.doRequest(parent, javaClient);
            } else if (JarFolderNode.is(parent)) {
                return JarFolderNode.doRequest(parent, javaClient);
            }
        }

        return super.resolveChildren(parent);
    }

}

export function isJavaNode(node: TreeNode) {
    return !!node && 'projectURI' in node;
}

export enum EntryType {
    FOLDER = "FOLDER",
    PACKAGE = "PACKAGE",
    FILE = "FILE",
    CLASS_FILE = "CLASS_FILE"
}

export interface LibraryNode extends SelectableTreeNode, ExpandableTreeNode, CompositeTreeNode {
    projectURI: string;
}

export interface JarNode extends SelectableTreeNode, ExpandableTreeNode, CompositeTreeNode {
    jar: Jar;
    projectURI: string;
}

export interface JarFolderNode extends SelectableTreeNode, ExpandableTreeNode, CompositeTreeNode {
    jarEntry: JarEntry;
    nodeID: string;
    projectURI: string;
}

export interface JarFileNode extends SelectableTreeNode {
    jarEntry: JarEntry;
    nodeID: string;
    projectURI: string;
    leaf: boolean;
}

export namespace LibraryNode {
    export function is(node: TreeNode | undefined): node is LibraryNode {
        return !!node && 'projectURI' in node && !('jar' in node) && !('jarEntry' in node);
    }

    export function create(projectURI: string, parent?: TreeNode): LibraryNode {
        const id = "LibraryNode"+projectURI;
        return <LibraryNode>{
            id,
            name: "External Libraries",
            projectURI,
            parent,
            visible: true,
            expanded: false,
            selected: false,
            children: [],
            icon: "java-externalLibraries-icon"
        };
    }

    export async function doRequest(parent: Readonly<LibraryNode>, javaClient: ILanguageClient): Promise<TreeNode[]> {
        const result = await javaClient.sendRequest(ExecuteCommandRequest.type, {
            command: GET_EXTERNAL_LIBRARIES_COMMAND,
            arguments: [
                {
                    projectUri: parent.projectURI
                }
            ]
        });

        const jarNodeArr: Array<TreeNode> = [];
        for (const jar of result as Array<Jar>) {
            const newJarNode = JarNode.create(jar, parent);
            jarNodeArr.push(newJarNode);
        }
        return jarNodeArr;
    }

}

export namespace JarNode {
    export function is(node: TreeNode | undefined): node is JarNode {
        return !!node && 'projectURI' in node && 'jar' in node;
    }

    export function create(jar: Jar, parent: Readonly<LibraryNode>): JarNode {
        const id = "jarNode-" + jar.name + "-" + jar.id;
        return <JarNode>{
            id,
            name: jar.name,
            jar,
            projectURI: parent.projectURI,
            parent,
            visible: true,
            expanded: false,
            selected: false,
            children: [],
            icon: "java-jar-icon"
        };
    }

    export async function doRequest(parent: Readonly<JarNode>, javaClient: ILanguageClient): Promise<TreeNode[]> {
        const result = await javaClient.sendRequest(ExecuteCommandRequest.type, {
            command: GET_LIBRARY_CHILDREN_COMMAND,
            arguments: [
                {
                    projectUri: parent.projectURI,
                    nodeId: parent.jar.id
                }
            ]
        });

        const jarEntryNodeArr: Array<TreeNode> = [];
        for (const entry of result as Array<JarEntry>) {
            const entryType = entry["entryType"];
            if (EntryType.FOLDER === entryType
                || EntryType.PACKAGE === entryType) {
                jarEntryNodeArr.push(JarFolderNode.create(entry, parent.jar.id, parent));
            } else if (EntryType.FILE === entryType
                || EntryType.CLASS_FILE === entryType) {
                jarEntryNodeArr.push(JarFileNode.create(entry, parent));
            }
        }

        return jarEntryNodeArr;
    }

}

export interface Jar {
    name: string;
    id: string;
}

export interface JarEntry {
    name: string;
    path: string;
    entryType: string;
    uri: string;
}

export namespace JarFolderNode {
    export function is(node: TreeNode | undefined): node is JarFolderNode {
        return !!node && 'projectURI' in node && 'jarEntry' in node && !("leaf" in node);
    }

    export function create(jarEntry: JarEntry, nodeID: string, parent: Readonly<JarNode | JarFolderNode>): JarFolderNode {
        const id = "jarFolderNode-" + jarEntry.name + "-" + jarEntry.path + "-" + jarEntry.uri;
        const icon = jarEntry.entryType === EntryType.FOLDER ? "java-folder-icon" : "java-package-icon";
        return <JarFolderNode>{
            id,
            name: jarEntry.name,
            jarEntry,
            nodeID: nodeID,
            projectURI: parent.projectURI,
            parent,
            visible: true,
            expanded: false,
            selected: false,
            children: [],
            icon: icon
        };
    }

    export async function doRequest(parent: Readonly<JarFolderNode>, javaClient: ILanguageClient): Promise<TreeNode[]> {
        const result = await javaClient.sendRequest(ExecuteCommandRequest.type, {
            command: GET_EXTERNAL_LIBRARIES_CHILDREN_COMMAND,
            arguments: [
                {
                    projectUri: parent.projectURI,
                    nodePath: parent.jarEntry.path,
                    nodeId: parent.nodeID
                }
            ]
        });

        const jarEntryNodeArr: Array<TreeNode> = [];
        for (const entry of result as Array<JarEntry>) {
            const entryType = entry["entryType"];
            if (EntryType.FOLDER === entryType
                || EntryType.PACKAGE === entryType) {
                jarEntryNodeArr.push(JarFolderNode.create(entry, parent.nodeID, parent));
            } else if (EntryType.FILE === entryType
                || EntryType.CLASS_FILE === entryType) {
                jarEntryNodeArr.push(JarFileNode.create(entry, parent));
            }
        }
        return jarEntryNodeArr;
    }

}

export namespace JarFileNode {
    export function is(node: TreeNode | undefined): node is JarFileNode {
        return !!node && 'projectURI' in node && 'jarEntry' in node && 'leaf' in node;
    }

    export function create(jarEntry: JarEntry, parent: Readonly<JarNode | JarFolderNode>): JarFileNode {
        const id = "jarFileNode-" + jarEntry.name + "-" + jarEntry.path + "-" + jarEntry.uri;
        const icon = jarEntry.entryType === EntryType.CLASS_FILE ? "java-class-icon" : "java-file-icon";
        return <JarFileNode>{
            id,
            name: jarEntry.name,
            parent,
            jarEntry,
            leaf: true,
            nodeID: parent.id,
            projectURI: parent.projectURI,
            visible: true,
            selected: false,
            icon: icon
        };
    }

}
