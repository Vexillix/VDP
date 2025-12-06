# GitHub 推送脚本
# 使用方法：运行此脚本，然后按照提示输入 GitHub 用户名和个人访问令牌

Write-Host "=== GitHub 推送脚本 ===" -ForegroundColor Green
Write-Host ""

# 检查远程仓库配置
$remoteUrl = git remote get-url origin
Write-Host "远程仓库: $remoteUrl" -ForegroundColor Cyan
Write-Host ""

# 提示用户输入凭据
Write-Host "请输入以下信息：" -ForegroundColor Yellow
$username = Read-Host "GitHub 用户名"
$token = Read-Host "个人访问令牌 (PAT)" -AsSecureString
$tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
)

# 配置 Git 凭据（临时）
$credential = "$username`:$tokenPlain"
$encodedCredential = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($credential))

# 设置远程 URL 包含凭据（仅用于本次推送）
$remoteUrlWithCred = $remoteUrl -replace 'https://', "https://$encodedCredential@"
git remote set-url origin $remoteUrlWithCred

Write-Host ""
Write-Host "正在推送到 GitHub..." -ForegroundColor Yellow

# 推送代码
try {
    git push -u origin main
    Write-Host ""
    Write-Host "✅ 推送成功！" -ForegroundColor Green
    Write-Host "访问仓库: https://github.com/Vexillix/-" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "❌ 推送失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查：" -ForegroundColor Yellow
    Write-Host "1. 个人访问令牌是否有 'repo' 权限" -ForegroundColor Yellow
    Write-Host "2. 仓库是否存在且有写入权限" -ForegroundColor Yellow
    Write-Host "3. 网络连接是否正常" -ForegroundColor Yellow
} finally {
    # 恢复原始远程 URL（移除凭据）
    git remote set-url origin $remoteUrl
}

Write-Host ""
Write-Host "脚本执行完成" -ForegroundColor Green

