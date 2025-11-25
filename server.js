const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    // 修改点 1: 这里改为读取 'index.html' (请确保您的文件也叫这个名字)
    const filePath = path.join(__dirname, 'index.html');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // 修改点 2: 将具体错误打印到 Zeabur 的 Runtime Logs 中，方便调试
            console.error("❌ 读取文件失败:", err);
            return res.status(500).send(`Error loading page: ${err.message} (请检查文件名是否为 index.html)`);
        }
        
        // 获取 Zeabur 注入的环境变量
        const apiKey = process.env.API_KEY || '';
        const apiRegion = process.env.API_REGION || 'bj';
        
        console.log(`✅ 页面请求成功，注入 Key 前缀: ${apiKey.substring(0, 5)}...`);

        // 构造注入脚本
        const injection = `
        <script>
            window._env_ = {
                API_KEY: "${apiKey}",
                API_REGION: "${apiRegion}"
            };
        </script>
        `;
        
        const result = data.replace('<head>', `<head>${injection}`);
        res.send(result);
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📂 Current directory: ${__dirname}`);
    // 打印一下当前目录下的文件，确认 index.html 是否真的存在
    fs.readdir(__dirname, (err, files) => {
        if (err) console.log("Unable to scan directory: " + err); 
        else console.log("📄 Files in current directory:", files);
    });
});
