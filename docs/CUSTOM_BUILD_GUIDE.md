# 定制化构建指南 - Linux & macOS 专用

## 🎯 概述

根据您的需求，我们创建了专门的工作流来构建：
- **平台**: Linux 和 macOS（Darwin）
- **nginx 版本**: 1.18.x 及以上，包括最新的 1.29.x
- **njs 版本**: 0.8.x 及以上
- **特殊功能**: 包含 TCP/UDP 代理支持（stream 模块）

## 📋 可用的工作流

### 1. 🚀 Custom Build (推荐)
**文件**: `.github/workflows/build-custom.yml`
- **用途**: 批量构建多个版本
- **特点**: 完全定制化，只构建您需要的版本
- **时间**: 2-3 小时（并行构建）

### 2. ⚡ Build Test  
**文件**: `.github/workflows/build-test.yml`
- **用途**: 快速单次测试
- **特点**: 简单参数选择
- **时间**: 10-30 分钟

## 🎛️ Custom Build 参数详解

| 参数 | 默认值 | 说明 | 建议设置 |
|------|--------|------|----------|
| **Build nginx** | ✅ | 是否构建 nginx | 保持默认 |
| **Build njs** | ✅ | 是否构建 njs | 根据需要选择 |
| **Nginx versions** | `1.18.x,1.20.x,1.22.x,1.24.x,1.26.x,1.27.x,1.28.x,1.29.x` | nginx 版本列表 | 可删除不需要的版本 |
| **NJS versions** | `0.8.x` | njs 版本 | 保持默认或添加 `0.8.x,0.9.x` |
| **Build variants** | `default,stream` | 构建变体 | 推荐保持默认 |
| **Platforms** | `linux,darwin` | 目标平台 | 保持默认 |
| **Architectures** | `x86_64,aarch64` | 目标架构 | 保持默认 |

## 🚀 快速开始

### 步骤 1: 推送代码
```bash
# 提交所有修改
git add .
git commit -m "Add custom build workflows for Linux/macOS with stream support"
git push origin master
```

### 步骤 2: 运行构建
1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择 **"Custom Build (Linux & macOS)"**
4. 点击 **"Run workflow"** 按钮
5. 根据需要调整参数（建议首次使用默认值）
6. 点击 **"Run workflow"** 开始构建

### 步骤 3: 监控构建
- 构建会并行运行多个任务
- 可以点击具体任务查看实时日志
- 预计 2-3 小时完成全部构建

## 📊 构建矩阵说明

使用默认参数将生成以下构建：

### nginx 构建 (32 个二进制文件)
```
版本: 1.18.x, 1.20.x, 1.22.x, 1.24.x, 1.26.x, 1.27.x, 1.28.x, 1.29.x (8个)
变体: default, stream (2个)
平台架构组合:
  - linux-x86_64
  - linux-aarch64  
  - darwin-x86_64
总计: 8 × 2 × 3 = 48 个构建任务
```

### njs 构建 (12 个二进制文件)
```
版本: 0.8.x (1个)
变体: default, debug (2个)
平台架构组合:
  - linux-x86_64
  - linux-aarch64
  - darwin-x86_64
总计: 1 × 2 × 3 = 6 个构建任务
```

## 🎯 针对您需求的优化建议

### 场景 1: 只要最新稳定版本
```yaml
Nginx versions: 1.26.x,1.28.x
Build variants: default,stream
```
**结果**: 12 个 nginx 二进制文件，构建时间约 45 分钟

### 场景 2: 只要 TCP/UDP 代理功能
```yaml
Nginx versions: 1.28.x,1.29.x
Build variants: stream
Build njs: false
```
**结果**: 6 个 nginx 二进制文件，构建时间约 30 分钟

### 场景 3: 只要 Linux x86_64
```yaml
Platforms: linux
Architectures: x86_64
```
**结果**: 大幅减少构建时间和资源消耗

## 📦 构建产物

### 文件命名规则
```
nginx-{version}-{variant}-{arch}-{platform}
njs-{version}-{variant}-{arch}-{platform}

示例:
- nginx-1.28.0-stream-x86_64-linux
- nginx-1.29.0-x86_64-darwin  
- njs-0.8.0-debug-aarch64-linux
```

### 获取方式

#### 方法 1: 从 Actions 下载
1. 构建完成后，进入 Actions 页面
2. 点击完成的构建
3. 在 "Artifacts" 部分下载需要的文件

#### 方法 2: 从 binaries 分支获取
```bash
# 直接下载（构建完成后）
curl -L -o nginx https://github.com/your-username/nginx-binaries/raw/binaries/nginx-1.28.0-stream-x86_64-linux
chmod +x nginx
```

#### 方法 3: 通过 GitHub Pages
如果启用了 GitHub Pages：
```bash
curl -L -o nginx https://your-username.github.io/nginx-binaries/nginx-1.28.0-stream-x86_64-linux
chmod +x nginx
```

## 🔧 验证构建结果

### 检查 nginx 功能
```bash
# 查看版本和编译选项
./nginx-1.28.0-stream-x86_64-linux -V

# 验证 stream 模块
./nginx-1.28.0-stream-x86_64-linux -V 2>&1 | grep -i stream

# 应该看到:
# --with-stream
# --with-stream_ssl_module
# --with-stream_realip_module
# --with-stream_ssl_preread_module
```

### 测试 TCP 代理功能
```bash
# 创建测试配置
cat > nginx-stream-test.conf << 'EOF'
events {
    worker_connections 1024;
}

stream {
    upstream backend {
        server 127.0.0.1:8080;
    }
    
    server {
        listen 3306;
        proxy_pass backend;
        proxy_timeout 1s;
        proxy_responses 1;
    }
}
EOF

# 测试配置
./nginx-1.28.0-stream-x86_64-linux -t -c nginx-stream-test.conf
```

## 🚨 故障排除

### 1. 没有 "Run workflow" 按钮
**原因**: 工作流文件可能有语法错误或未推送到默认分支

**解决方案**:
```bash
# 检查文件是否存在
ls -la .github/workflows/

# 验证 YAML 语法
python -c "import yaml; yaml.safe_load(open('.github/workflows/build-custom.yml'))"

# 确保在默认分支
git branch
git push origin master
```

### 2. 构建失败
**常见原因**:
- 版本号不存在（如 1.29.x 可能还未发布）
- 网络问题导致源码下载失败
- 依赖包安装失败

**解决方案**:
```bash
# 移除可能不存在的版本
Nginx versions: 1.26.x,1.28.x  # 移除 1.29.x

# 或者查看构建日志确定具体错误
```

### 3. 权限问题
```bash
# 确保脚本有执行权限
chmod +x scripts/*
git add scripts/
git commit -m "Fix script permissions"
git push
```

### 4. 存储空间不足
- GitHub 免费账户有 500MB 存储限制
- 定期清理旧的 artifacts
- 考虑只保留最新版本

## 💡 最佳实践

### 1. 渐进式构建
```bash
# 第一次：只构建一个版本测试
Nginx versions: 1.28.x
Build variants: stream

# 成功后：构建更多版本
Nginx versions: 1.26.x,1.28.x
Build variants: default,stream
```

### 2. 定期更新
- 每月运行一次获取最新版本
- 关注 nginx 官方发布公告
- 及时更新版本列表

### 3. 资源优化
- 不需要 Windows 版本时，使用 Custom Build
- 只构建需要的架构（如只要 x86_64）
- 考虑分批构建以避免超时

### 4. 自动化集成
```javascript
// 在您的项目中使用
const { NginxBinary } = require('nginx-binaries')

// 配置使用您的仓库
NginxBinary.repoUrl = 'https://your-username.github.io/nginx-binaries'

// 下载支持 TCP 代理的版本
const nginxPath = await NginxBinary.download({
  version: '1.28.x',
  variant: 'stream',
  os: 'linux',
  arch: 'x86_64'
})
```

## 🎉 总结

通过这个定制化的构建系统，您可以：

✅ **精确控制**: 只构建需要的平台和版本  
✅ **TCP/UDP 代理**: 完整的 4层负载均衡支持  
✅ **自动化**: 一键构建多个版本  
✅ **高效**: 并行构建节省时间  
✅ **灵活**: 随时调整构建参数  

现在您拥有了一个完全定制的 nginx 构建系统，专门针对 Linux 和 macOS 平台，包含最新的版本和 TCP/UDP 代理功能！