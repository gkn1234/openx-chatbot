import type { Project } from '@pnpm/find-workspace-packages';
import type { NormalizedPackageJson } from 'read-pkg';
import { readFile, writeFile } from 'node:fs/promises';
import { argv } from 'node:process';
import { findWorkspacePackages } from '@pnpm/find-workspace-packages';
import { readPackage } from 'read-pkg';
import { parse } from 'yaml';

const [
  ,,
  override = 'false',
  pkgPath = 'app',
] = argv;

const pkgJson = await readPackage({
  cwd: pkgPath,
});

const workspaceStr = await readFile('pnpm-workspace.yaml', 'utf-8');
const workspaceYaml = parse(workspaceStr);

const catalogMap: Record<string, any> = workspaceYaml.catalog || {};
const catalogsMap: Record<string, any> = workspaceYaml.catalogs || {};

const pkgs = await findWorkspacePackages('.');

restoreDependencies(pkgJson, 'dependencies');
restoreDependencies(pkgJson, 'devDependencies');
restoreDependencies(pkgJson, 'peerDependencies');

console.log(pkgJson);

if (override !== 'false') {
  const jsonStr = JSON.stringify(pkgJson, null, 2);
  await writeFile(`${pkgPath}/package.json`, jsonStr, 'utf-8');
}

function restoreDependencies(json: NormalizedPackageJson, key: 'dependencies' | 'devDependencies' | 'peerDependencies') {
  Object.entries(json[key] || {}).forEach(([name, version]) => {
    if (!json[key] || !version) {
      return;
    }

    if (version === 'catalog:') {
      const catalogVersion = catalogMap[name];
      if (catalogVersion) {
        json[key][name] = catalogVersion;
      }
      return;
    }

    if (version.startsWith('workspace')) {
      const workspaceVersion = restoreWorkspaceVersion(pkgs, name, version);
      if (workspaceVersion) {
        json[key][name] = workspaceVersion;
      }
      return;
    }

    const catalogsReg = /catalog:(.*)/;
    const [, catalogName = ''] = version.match(catalogsReg) || [];
    if (catalogName) {
      const catalogVersions = catalogsMap[catalogName] || {};
      const catalogVersion = catalogVersions[name];
      if (catalogVersion) {
        json[key][name] = catalogVersion;
      }
    }
  });
}

function restoreWorkspaceVersion(projects: Project[], name: string, version: string) {
  const pkg = projects.find(p => p.manifest.name === name);
  if (!pkg) {
    return '';
  }

  const reg = /workspace:(.*)/;
  const [, signal = ''] = version.match(reg) || [];

  return `${signal}${pkg.manifest.version}`;
}
