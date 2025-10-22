## CI 构建环境下载 debian-openssl-3.0.x 失败时如何处理

前往下面地址下载二进制文件
```
https://binaries.prisma.sh/all_commits/659ef412370fa3b41cd7bf6e94587c1dfb7f67e7/debian-openssl-3.0.x/libquery_engine.so.gz
https://binaries.prisma.sh/all_commits/659ef412370fa3b41cd7bf6e94587c1dfb7f67e7/debian-openssl-3.0.x/migration-engine.gz
https://binaries.prisma.sh/all_commits/659ef412370fa3b41cd7bf6e94587c1dfb7f67e7/rhel-openssl-1.1.x/prisma-fmt.gz
https://binaries.prisma.sh/all_commits/659ef412370fa3b41cd7bf6e94587c1dfb7f67e7/rhel-openssl-1.1.x/query-engine.gz
```

将二进制文件传入构建机，解压并赋予执行权限
```bash
mkdir /root/prisma-engine

# 建好文件夹后，传入文件到该目录

# 解压
gzip -dk libquery_engine.so.node.gz
gzip -dk migration-engine.gz
gzip -dk prisma-fmt.gz
gzip -dk query-engine.gz

# 授权
chmod +755 libquery_engine.so.node
chmod +755 migration-engine
chmod +755 prisma-fmt
chmod +755 query-engine
```

之后可设置环境变量，将以下内容插入到 `~/.bashrc` 文件末尾
```bash
ENGINE_DIR="/root/prisma-engine"
export PRISMA_QUERY_ENGINE_LIBRARY="${ENGINE_DIR}/libquery_engine.so.node"
export PRISMA_QUERY_ENGINE_BINARY="${ENGINE_DIR}/query-engine"
export PRISMA_SCHEMA_ENGINE_BINARY="${ENGINE_DIR}/migration-engine"
export PRISMA_FMT_BINARY="${ENGINE_DIR}/prisma-fmt"
```
