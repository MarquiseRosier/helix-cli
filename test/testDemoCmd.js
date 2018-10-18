/*
 * Copyright 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env mocha */

const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const $ = require('shelljs');
const { assertFile, createTestRoot } = require('./utils.js');

const DemoCommand = require('../src/demo.cmd');

const pwd = process.cwd();

describe('Integration test for demo command', function suite() {
  this.timeout(3000);
  let testDir;

  beforeEach(async () => {
    testDir = await createTestRoot();
  });

  afterEach('Change back to original working dir', () => {
    process.chdir(pwd);
  });

  it('demo type simple creates all files', async () => {
    await new DemoCommand()
      .withDirectory(testDir)
      .withName('project1')
      .run();
    assertFile(path.resolve(testDir, 'project1', '.gitignore'));
    assertFile(path.resolve(testDir, 'project1', 'src/html.htl'));
    assertFile(path.resolve(testDir, 'project1', 'src/html.pre.js'));
    assertFile(path.resolve(testDir, 'project1', 'index.md'));
    assertFile(path.resolve(testDir, 'project1', 'src/style.css'));
    assertFile(path.resolve(testDir, 'project1', 'src/favicon.ico'));
    assertFile(path.resolve(testDir, 'project1', 'helix_logo.png'));
  });

  it('demo type full creates all files', async () => {
    await new DemoCommand()
      .withDirectory(testDir)
      .withName('project1')
      .withType('full')
      .run();
    assertFile(path.resolve(testDir, 'project1', '.gitignore'));
    assertFile(path.resolve(testDir, 'project1', 'src/html.htl'));
    assertFile(path.resolve(testDir, 'project1', 'src/html.pre.js'));
    assertFile(path.resolve(testDir, 'project1', 'index.md'));
    assertFile(path.resolve(testDir, 'project1', 'README.md'));
    assertFile(path.resolve(testDir, 'project1', 'src/bootstrap.min.css'));
    assertFile(path.resolve(testDir, 'project1', 'src/favicon.ico'));
    assertFile(path.resolve(testDir, 'project1', 'helix_logo.png'));
  });

  it('demo does not leave any files not checked in', async () => {
    await new DemoCommand()
      .withDirectory(testDir)
      .withName('project2')
      .run();
    process.chdir(path.resolve(testDir, 'project2'));
    const status = $.exec('git status --porcelain', { silent: true });
    assert.equal('', status.stdout);
  });

  it('files generated in /dist are not ignored (simple)', async () => {
    await new DemoCommand()
      .withDirectory(testDir)
      .withName('project2')
      .run();
    const distDir = path.resolve(testDir, 'project2', 'dist');
    await fs.ensureDir(distDir);
    await fs.writeFile(path.resolve(distDir, 'foo.js'), '// do not ignore!', 'utf-8');
    process.chdir(path.resolve(testDir, 'project2'));
    const status = $.exec('git status --porcelain', { silent: true });
    assert.equal(status.stdout.trim(), '?? dist/');
  });

  it('files generated in /dist are not ignored (full)', async () => {
    await new DemoCommand()
      .withDirectory(testDir)
      .withName('project2')
      .withType('full')
      .run();
    const distDir = path.resolve(testDir, 'project2', 'dist');
    await fs.ensureDir(distDir);
    await fs.writeFile(path.resolve(distDir, 'foo.js'), '// do not ignore!', 'utf-8');
    process.chdir(path.resolve(testDir, 'project2'));
    const status = $.exec('git status --porcelain', { silent: true });
    assert.equal(status.stdout.trim(), '?? dist/');
  });
});
