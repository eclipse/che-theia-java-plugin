import { FileStat } from "@theia/filesystem/lib/common";


export class JavaUtils {

    static FILE = "file://";

    static getRootProjectURI(roots: FileStat[], path: string): string | undefined {
        if (roots) {
            for (const root of roots) {
                if (path.includes(root.uri)) {
                    return root.uri;
                }
            }
        }
        return undefined;
    }

    static uriToTreeNodeID(uri: string) {
        return uri.replace(this.FILE, "");
    }

    static getIDFromMultiRootID(multiRootID: string) {
        const fixed = multiRootID.split(":");
        const uri = fixed[1];
        return JavaUtils.FILE + uri;
    }

    static getMultiRootReadyURI(root: string, treeNodePath: string) {
        const fixedRoot = root.replace(JavaUtils.FILE, "");
        const fixedTreeNodePath = treeNodePath.replace(JavaUtils.FILE, "");
        return fixedRoot + ":" + fixedTreeNodePath;
    }


}