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

import { injectable, inject } from "inversify";
import URI from "@theia/core/lib/common/uri";
import { Resource, ResourceResolver } from '@theia/core/lib/common';
import { ClassFileContentsRequest } from '@theia/java/lib/browser';
import { LanguageClientProvider } from "@theia/languages/lib/browser/language-client-provider";
import { ILanguageClient } from "@theia/languages/lib/common";

export class CheLibResource implements Resource {

    constructor(
        public uri: URI,
        protected readonly clientContribution: Promise<ILanguageClient | undefined>
    ) { }

    dispose(): void {
    }

    readContents(options: { encoding?: string }): Promise<string> {
        const uri = this.uri.toString();
        return this.clientContribution.then(languageClient => {
            if (languageClient) {
                languageClient.sendRequest(ClassFileContentsRequest.type, { uri }).then(content =>
                    content || ''
                )
            }
            return '';   
        });
    }

}

@injectable()
export class CheLibResourceResolver implements ResourceResolver {

    constructor(
        @inject(LanguageClientProvider)
    protected readonly languageClientProvider: LanguageClientProvider
    ) { }

    resolve(uri: URI): CheLibResource {
        if (!(uri.scheme === "chelib")) {
            throw new Error("The given URI is not a valid Chelib uri: " + uri);
        }
        let javaClient = this.languageClientProvider.getLanguageClient("java");
        return new CheLibResource(uri, javaClient);
    }

}
