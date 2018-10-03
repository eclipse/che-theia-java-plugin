/*
 * Copyright (c) 2018 Red Hat, Inc.
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
import URI from '@theia/core/lib/common/uri';
import { ResourceResolver } from '@theia/core/lib/common';
import { JavaClientContribution, JavaResource } from '@theia/java/lib/browser';

@injectable()
export class CheLibResourceResolver implements ResourceResolver {

    constructor(
        @inject(JavaClientContribution)
    protected readonly javaClientContribution: JavaClientContribution
    ) { }

    resolve(uri: URI): JavaResource {
        if (uri.scheme !== 'chelib') {
            throw new Error(`The given URI is not a valid Chelib uri: ${uri}`);
        }
        return new JavaResource(uri, this.javaClientContribution);
    }

}
