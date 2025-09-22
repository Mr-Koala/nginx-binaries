# GitHub Workflow 优化总结

## 🎯 优化目标
1. 默认同时构建 njs shell、njs HTTP 模块和 njs Stream（TCP）模块
2. 只构建 nginx 1.28 及以上版本
3. 移除 Windows 构建
4. 修复 workflow 语法错误

## ✅ 完成的修改

### 1. `scripts/build-njs` 脚本增强
- **新增命令行参数**：
  - `--modules-only`: 只构建 nginx 模块（跳过 shell）
  - `--with-modules`: 同时构建 shell 和 nginx 模块
  - `--module-type TYPE`: 指定模块类型（both/http/stream）
  - `--help`: 显示帮助信息

- **新增模块构建功能**：
  - 构建 `ngx_http_js_module.so` (HTTP 模块)
  - 构建 `ngx_stream_js_module.so` (Stream/TCP 模块)
  - 自动检测 nginx 源码目录
  - 生成模块压缩包 `njs-modules-VERSION-ARCH-OS.tar.gz`

### 2. GitHub Workflows 更新

#### `binaries.yml` (主要构建流程)
- ✅ 移除了所有 Windows (`nginx-x86_64-win32`) 构建
- ✅ 更新 nginx 版本矩阵：只构建 `1.28.x` 和 `1.29.x`
- ✅ 移除了旧版本 `1.26.x` 和 `1.27.x`
- ✅ 添加 nginx 源码下载步骤用于模块构建
- ✅ 使用 `--with-modules` 参数默认构建模块
- ✅ 更新依赖包（添加 libedit、ncurses）

#### `build-linux.yml` (Linux 优化构建)
- ✅ 添加 nginx 源码下载步骤
- ✅ 使用 `--with-modules` 参数
- ✅ 更新依赖包
- ✅ 修复 YAML 语法错误（多行字符串格式）

#### `build-custom.yml` (自定义构建)
- ✅ 添加 nginx 源码下载步骤
- ✅ 支持 Linux 和 macOS 平台的模块构建
- ✅ 使用 `--with-modules` 参数

#### `build-test.yml` (测试构建)
- ✅ 添加 nginx 源码下载步骤
- ✅ 支持 Linux 和 macOS 平台的模块构建
- ✅ 使用 `--with-modules` 参数

### 3. 构建产物
现在每次构建会生成：
- **njs shell**: `njs-VERSION-VARIANT-ARCH-OS` (交互式 JavaScript 解释器)
- **nginx 模块**: `njs-modules-VERSION-VARIANT-ARCH-OS.tar.gz` (包含 HTTP 和 Stream 模块)
- **校验和文件**: 对应的 `.sha1` 文件
- **源码信息**: `.sources` 文件

## 🚀 使用方式

### 本地构建
```bash
# 只构建 shell（原有功能）
./scripts/build-njs

# 同时构建 shell 和模块（推荐）
./scripts/build-njs --with-modules

# 只构建 nginx 模块
./scripts/build-njs --modules-only

# 只构建 HTTP 模块
./scripts/build-njs --modules-only --module-type http

# 只构建 Stream 模块  
./scripts/build-njs --modules-only --module-type stream
```

### GitHub Actions
在 GitHub Actions 中，所有 workflow 现在默认会：
1. 下载 njs 和 nginx 源码
2. 构建 njs shell 和两个 nginx 模块
3. 将所有产物打包上传到 artifacts

### 支持的平台和架构
- **Linux**: x86_64, aarch64, ppc64le
- **macOS**: x86_64
- **nginx 版本**: 1.28.x, 1.29.x
- **njs 版本**: 0.x.x

## 🔧 技术细节

### 模块构建过程
1. 配置 nginx 使用 `--with-compat` 和 `--add-dynamic-module`
2. 分别构建 HTTP 和 Stream 模块
3. 使用 `NJS_LIBXSLT=NO` 减少依赖
4. 生成动态模块文件 `.so`

### 依赖管理
- 添加了 `libedit-dev` 和 `ncurses-dev` 用于 shell 构建
- 保持静态链接以确保二进制文件的可移植性
- 在 macOS 上移除动态库强制使用静态库

## ✅ 验证结果
所有修改已通过测试：
- ✅ build-njs 脚本语法正确且可执行
- ✅ 所有 workflow 文件存在且语法正确
- ✅ Windows 构建已移除
- ✅ 只构建 nginx 1.28+ 版本
- ✅ 所有 workflow 使用 `--with-modules` 参数

## 🎉 总结
现在的构建系统能够：
1. **默认同时构建** njs shell、HTTP 模块和 Stream 模块
2. **只支持现代版本** nginx 1.28+ 
3. **跨平台支持** Linux 和 macOS
4. **灵活配置** 支持多种构建选项
5. **自动化部署** 通过 GitHub Actions

这样就完全满足了在 GitHub workflow 中默认同时构建 njs shell、njs HTTP 模块和 njs Stream（TCP）模块的需求！