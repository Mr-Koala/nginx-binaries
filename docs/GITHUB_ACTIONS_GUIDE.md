# GitHub Actions 使用指南

## 问题诊断：为什么没有"Run workflow"按钮？

### 常见原因和解决方案

#### 1. 缺少 `workflow_dispatch` 触发器

**问题**: 工作流只有 `push`、`pull_request` 和 `schedule` 触发器，没有手动触发选项。

**解决方案**: 我们已经在 `.github/workflows/binaries.yml` 中添加了 `workflow_dispatch` 配置：

```yaml
on:
  workflow_dispatch:
    inputs:
      nginx_versions:
        description: 'Nginx versions to build'
        required: false
        default: '1.28.x'
        type: string
      # ... 其他输入参数
```

#### 2. 工作流文件语法错误

**检查方法**:
1. 在 GitHub 仓库中进入 Actions 页面
2. 如果有语法错误，会显示红色错误图标
3. 点击查看具体错误信息

**常见语法问题**:
- YAML 缩进错误
- 引号不匹配
- 环境变量格式错误

#### 3. 权限问题

**检查步骤**:
1. 进入仓库 Settings → Actions → General
2. 确保 "Actions permissions" 设置为 "Allow all actions and reusable workflows"
3. 确保 "Workflow permissions" 设置为 "Read and write permissions"

#### 4. 分支问题

**注意事项**:
- 工作流文件必须在默认分支（通常是 `main` 或 `master`）
- 如果在其他分支，需要先合并到默认分支

## 解决方案

### 方案 1: 使用新的测试工作流（推荐）

我们创建了一个简化的 `.github/workflows/build-test.yml` 工作流，专门用于手动测试：

**特点**:
- ✅ 简单的下拉菜单选择
- ✅ 快速构建单个配置
- ✅ 清晰的参数选项
- ✅ 支持所有平台

**使用步骤**:
1. 推送代码到 GitHub
2. 进入 Actions 页面
3. 选择 "Build Test" 工作流
4. 点击 "Run workflow"
5. 选择参数：
   - Nginx version: 1.28.x
   - Build variant: stream
   - Target architecture: x86_64
   - Target platform: linux
6. 点击 "Run workflow" 开始构建

### 方案 2: 修复原有工作流

原有的 `binaries.yml` 工作流现在也支持手动触发，但参数更复杂：

**使用方法**:
1. 进入 Actions → binaries
2. 点击 "Run workflow"
3. 输入参数（可选）：
   - `nginx_versions`: "1.28.x,1.27.x"
   - `variants`: ",stream"
   - `architectures`: "x86_64,aarch64"
   - `skip_njs`: true（跳过 njs 构建以加快速度）

## 推送代码并测试

### 1. 提交并推送修改

```bash
# 添加所有修改
git add .

# 提交修改
git commit -m "Add stream support and manual workflow triggers

- Add workflow_dispatch to binaries.yml
- Create build-test.yml for quick testing
- Add stream variant support
- Update documentation"

# 推送到 GitHub
git push origin master  # 或 main
```

### 2. 验证工作流

推送后，检查以下内容：

1. **进入 GitHub Actions 页面**:
   - 应该看到两个工作流：`binaries` 和 `Build Test`
   - 每个都应该有 "Run workflow" 按钮

2. **测试 Build Test 工作流**:
   - 点击 "Build Test"
   - 点击 "Run workflow"
   - 选择参数并运行

3. **检查构建状态**:
   - 构建应该开始运行
   - 可以点击查看实时日志

## 故障排除

### 如果仍然没有 "Run workflow" 按钮

1. **检查文件位置**:
   ```bash
   # 确保文件在正确位置
   ls -la .github/workflows/
   ```

2. **验证 YAML 语法**:
   ```bash
   # 使用在线 YAML 验证器检查语法
   # 或使用 yamllint（如果已安装）
   yamllint .github/workflows/build-test.yml
   ```

3. **检查分支**:
   ```bash
   # 确保在默认分支
   git branch
   git status
   ```

4. **强制刷新**:
   - 在浏览器中硬刷新 Actions 页面（Ctrl+F5）
   - 或者尝试无痕模式

### 如果构建失败

1. **检查日志**:
   - 点击失败的构建
   - 查看具体错误信息

2. **常见问题**:
   - **权限错误**: 检查 GITHUB_TOKEN 权限
   - **依赖问题**: 确保所有脚本文件存在
   - **网络问题**: 重新运行构建

3. **调试技巧**:
   ```yaml
   # 在工作流中添加调试步骤
   - name: Debug environment
     run: |
       echo "Current directory: $(pwd)"
       echo "Files: $(ls -la)"
       echo "Environment variables:"
       env | sort
   ```

## 使用构建的二进制文件

### 下载 Artifacts

1. **从 Actions 页面下载**:
   - 进入完成的构建
   - 在 "Artifacts" 部分下载 zip 文件

2. **解压并使用**:
   ```bash
   # 解压下载的文件
   unzip nginx-1.28.x-stream-x86_64-linux.zip
   
   # 添加执行权限
   chmod +x nginx-1.28.0-stream-x86_64-linux
   
   # 测试
   ./nginx-1.28.0-stream-x86_64-linux -V
   ```

### 验证 Stream 支持

```bash
# 检查是否包含 stream 模块
./nginx-1.28.0-stream-x86_64-linux -V 2>&1 | grep -i stream

# 应该看到类似输出：
# --with-stream
# --with-stream_ssl_module
# --with-stream_realip_module
# --with-stream_ssl_preread_module
```

## 自动化部署（可选）

如果您想要自动发布到 GitHub Releases：

```yaml
# 在工作流末尾添加
- name: Create Release
  if: github.ref == 'refs/heads/master'
  uses: softprops/action-gh-release@v1
  with:
    tag_name: nginx-${{ inputs.nginx_version }}-${{ github.run_number }}
    name: nginx ${{ inputs.nginx_version }} with stream support
    files: artifact/*
    draft: false
    prerelease: false
```

## 总结

通过以上修改，您现在应该能够：

1. ✅ 看到 "Run workflow" 按钮
2. ✅ 手动触发构建
3. ✅ 构建支持 TCP/UDP 代理的 nginx
4. ✅ 下载和使用构建的二进制文件

如果还有问题，请检查 GitHub Actions 的日志输出，通常会有详细的错误信息帮助诊断问题。