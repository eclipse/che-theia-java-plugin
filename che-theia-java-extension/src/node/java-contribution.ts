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

const packageJson = require('../../package.json');
const bundleVersion = packageJson['bundle']['version'];

import { injectable } from 'inversify';
import { JavaExtensionContribution } from '@theia/java/lib/node/java-extension-model';
import * as path from 'path';

@injectable()
export class JavaExtension implements JavaExtensionContribution {
    getExtensionBundles(): string[] {
        const downloadDirPath = path.join(__dirname, '/../../download');

        const archiveCoreName = `jdt.ls.extension.core-${bundleVersion}.jar`;
        const archiveCorePath = path.join(downloadDirPath, archiveCoreName);
        
        const archiveAPIName = `jdt.ls.extension.api-${bundleVersion}.jar`;
        const archiveAPIPath = path.join(downloadDirPath, archiveAPIName);
        
        return [archiveAPIPath, archiveCorePath];
    }
}

