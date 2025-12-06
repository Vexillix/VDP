// DOM元素
const imageInput = document.getElementById('imageInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileName = document.getElementById('fileName');
const subtitleHeight = document.getElementById('subtitleHeight');
const fontSize = document.getElementById('fontSize');
const fontColor = document.getElementById('fontColor');
const fontColorText = document.getElementById('fontColorText');
const outlineColor = document.getElementById('outlineColor');
const outlineColorText = document.getElementById('outlineColorText');
const fontFamily = document.getElementById('fontFamily');
const fontWeight = document.getElementById('fontWeight');
const subtitleContent = document.getElementById('subtitleContent');
const previewCanvas = document.getElementById('previewCanvas');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const generateBtn = document.getElementById('generateBtn');
const saveBtn = document.getElementById('saveBtn');
const notification = document.getElementById('notification');

// 全局变量
let currentImage = null;
let canvasContext = null;

// 初始化
function init() {
    // 设置Canvas上下文
    canvasContext = previewCanvas.getContext('2d');
    
    // 绑定事件
    uploadBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageUpload);
    
    // 配置项变化监听
    subtitleHeight.addEventListener('input', updatePreview);
    fontSize.addEventListener('input', updatePreview);
    fontColor.addEventListener('input', () => {
        fontColorText.value = fontColor.value;
        updatePreview();
    });
    fontColorText.addEventListener('input', () => {
        if (/^#[0-9A-F]{6}$/i.test(fontColorText.value)) {
            fontColor.value = fontColorText.value;
            updatePreview();
        }
    });
    outlineColor.addEventListener('input', () => {
        outlineColorText.value = outlineColor.value;
        updatePreview();
    });
    outlineColorText.addEventListener('input', () => {
        if (/^#[0-9A-F]{6}$/i.test(outlineColorText.value)) {
            outlineColor.value = outlineColorText.value;
            updatePreview();
        }
    });
    fontFamily.addEventListener('change', updatePreview);
    fontWeight.addEventListener('change', updatePreview);
    subtitleContent.addEventListener('input', updatePreview);
    
    // 按钮事件
    generateBtn.addEventListener('click', generateImage);
    saveBtn.addEventListener('click', saveImage);
}

// 处理图片上传
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('请选择有效的图片文件！', 'error');
        return;
    }
    
    fileName.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            updatePreview();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// 更新预览
function updatePreview() {
    if (!currentImage) {
        previewCanvas.style.display = 'none';
        previewPlaceholder.classList.remove('hidden');
        return;
    }
    
    previewPlaceholder.classList.add('hidden');
    previewCanvas.style.display = 'block';
    
    // 获取配置
    const config = getConfig();
    
    // 计算Canvas尺寸（保持图片比例，最大宽度800px）
    const maxWidth = 800;
    let canvasWidth = currentImage.width;
    let canvasHeight = currentImage.height;
    
    if (canvasWidth > maxWidth) {
        const ratio = maxWidth / canvasWidth;
        canvasWidth = maxWidth;
        canvasHeight = canvasHeight * ratio;
    }
    
    // 设置Canvas尺寸
    previewCanvas.width = canvasWidth;
    previewCanvas.height = canvasHeight + config.subtitleHeight;
    
    // 绘制图片
    canvasContext.drawImage(currentImage, 0, 0, canvasWidth, canvasHeight);
    
    // 绘制字幕
    drawSubtitles(canvasWidth, canvasHeight, config);
}

// 获取配置
function getConfig() {
    return {
        subtitleHeight: parseInt(subtitleHeight.value) || 80,
        fontSize: parseInt(fontSize.value) || 40,
        fontColor: fontColor.value || '#FFFFFF',
        outlineColor: outlineColor.value || '#000000',
        fontFamily: fontFamily.value || 'Microsoft YaHei',
        fontWeight: fontWeight.value || 'normal',
        content: subtitleContent.value || ''
    };
}

// 绘制字幕（核心功能：每行独立背景块）
function drawSubtitles(canvasWidth, imageHeight, config) {
    if (!config.content.trim()) return;
    
    const lines = config.content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;
    
    // 设置字体
    canvasContext.font = `${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`;
    canvasContext.textAlign = 'center';
    canvasContext.textBaseline = 'middle';
    
    // 计算每行的高度和间距
    const lineHeight = config.fontSize * 1.5; // 行高为字体大小的1.5倍
    const totalTextHeight = lines.length * lineHeight;
    const padding = (config.subtitleHeight - totalTextHeight) / (lines.length + 1);
    
    // 字幕区域起始Y坐标
    const subtitleStartY = imageHeight;
    
    // 背景颜色（半透明黑色，可根据需要调整）
    const backgroundColor = 'rgba(0, 0, 0, 0.6)';
    
    // 绘制每行字幕（带独立背景块）
    lines.forEach((line, index) => {
        // 计算当前行的Y坐标
        const lineY = subtitleStartY + padding + (index * (lineHeight + padding)) + (lineHeight / 2);
        
        // 计算背景块的Y坐标和高度
        const bgY = subtitleStartY + padding + (index * (lineHeight + padding));
        const bgHeight = lineHeight;
        
        // 绘制背景块（每行独立）
        canvasContext.fillStyle = backgroundColor;
        canvasContext.fillRect(0, bgY, canvasWidth, bgHeight);
        
        // 绘制文字轮廓（描边）
        canvasContext.strokeStyle = config.outlineColor;
        canvasContext.lineWidth = Math.max(2, config.fontSize * 0.1); // 轮廓宽度
        canvasContext.lineJoin = 'round';
        canvasContext.miterLimit = 2;
        canvasContext.strokeText(line.trim(), canvasWidth / 2, lineY);
        
        // 绘制文字填充
        canvasContext.fillStyle = config.fontColor;
        canvasContext.fillText(line.trim(), canvasWidth / 2, lineY);
    });
}

// 生成图片
function generateImage() {
    if (!currentImage) {
        showNotification('请先上传图片！', 'error');
        return;
    }
    
    // 创建完整尺寸的Canvas
    const fullCanvas = document.createElement('canvas');
    const fullCtx = fullCanvas.getContext('2d');
    
    // 使用原始图片尺寸
    const imgWidth = currentImage.width;
    const imgHeight = currentImage.height;
    const config = getConfig();
    
    fullCanvas.width = imgWidth;
    fullCanvas.height = imgHeight + config.subtitleHeight;
    
    // 绘制图片
    fullCtx.drawImage(currentImage, 0, 0, imgWidth, imgHeight);
    
    // 绘制字幕
    drawSubtitlesOnCanvas(fullCtx, imgWidth, imgHeight, config);
    
    // 更新预览Canvas
    previewCanvas.width = imgWidth;
    previewCanvas.height = imgHeight + config.subtitleHeight;
    previewCanvas.getContext('2d').drawImage(fullCanvas, 0, 0);
    
    showNotification('字幕图片生成成功！');
}

// 在指定Canvas上绘制字幕
function drawSubtitlesOnCanvas(ctx, canvasWidth, imageHeight, config) {
    if (!config.content.trim()) return;
    
    const lines = config.content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;
    
    // 设置字体
    ctx.font = `${config.fontWeight} ${config.fontSize}px ${config.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 计算每行的高度和间距
    const lineHeight = config.fontSize * 1.5;
    const totalTextHeight = lines.length * lineHeight;
    const padding = (config.subtitleHeight - totalTextHeight) / (lines.length + 1);
    
    // 字幕区域起始Y坐标
    const subtitleStartY = imageHeight;
    
    // 背景颜色
    const backgroundColor = 'rgba(0, 0, 0, 0.6)';
    
    // 绘制每行字幕（带独立背景块）
    lines.forEach((line, index) => {
        // 计算当前行的Y坐标
        const lineY = subtitleStartY + padding + (index * (lineHeight + padding)) + (lineHeight / 2);
        
        // 计算背景块的Y坐标和高度
        const bgY = subtitleStartY + padding + (index * (lineHeight + padding));
        const bgHeight = lineHeight;
        
        // 绘制背景块（每行独立，呈现切割感）
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, bgY, canvasWidth, bgHeight);
        
        // 绘制文字轮廓
        ctx.strokeStyle = config.outlineColor;
        ctx.lineWidth = Math.max(2, config.fontSize * 0.1);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(line.trim(), canvasWidth / 2, lineY);
        
        // 绘制文字填充
        ctx.fillStyle = config.fontColor;
        ctx.fillText(line.trim(), canvasWidth / 2, lineY);
    });
}

// 保存图片
function saveImage() {
    if (!currentImage) {
        showNotification('请先上传图片并生成字幕！', 'error');
        return;
    }
    
    // 创建完整尺寸的Canvas
    const fullCanvas = document.createElement('canvas');
    const fullCtx = fullCanvas.getContext('2d');
    
    const imgWidth = currentImage.width;
    const imgHeight = currentImage.height;
    const config = getConfig();
    
    fullCanvas.width = imgWidth;
    fullCanvas.height = imgHeight + config.subtitleHeight;
    
    // 绘制图片
    fullCtx.drawImage(currentImage, 0, 0, imgWidth, imgHeight);
    
    // 绘制字幕
    drawSubtitlesOnCanvas(fullCtx, imgWidth, imgHeight, config);
    
    // 转换为图片并下载
    fullCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `字幕图片_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('图片保存成功！');
    }, 'image/png');
}

// 显示通知
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type === 'error' ? 'error' : 'show'}`;
    
    if (type === 'error') {
        notification.style.background = '#ff4d4f';
    } else {
        notification.style.background = '#52c41a';
    }
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

