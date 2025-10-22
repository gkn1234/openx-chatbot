import { readPackage } from 'read-pkg';

export interface GetExternalDependenciesOptions {
  exclude?: (string | RegExp)[]
  peerExclude?: (string | RegExp)[]
}

export async function getExternalDependencies(options?: GetExternalDependenciesOptions) {
  const {
    exclude = [],
    peerExclude = [],
  } = options || {};

  const pkg = await readPackage();
  const {
    dependencies = {},
    peerDependencies = {},
  } = pkg;

  const defaultExternal: (string | RegExp)[] = [
    // 将所有 node 原生模块都进行外部化处理
    /^node:.*/,
  ];

  const toReg = (item: string) => new RegExp(`^${item}`);
  const externals = defaultExternal.concat(
    Object.keys(peerDependencies).filter(k => !excludeCheck(peerExclude, k)).map(toReg),
    Object.keys(dependencies).filter(k => !excludeCheck(exclude, k)).map(toReg),
  );

  return externals;
}

function excludeCheck(exclude: (string | RegExp)[], item: string) {
  return exclude.some(e => typeof e === 'string' ? e === item : e.test(item));
}
