const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    // 读取 HTML 模板
    const filePath = path.join(__dirname, 'AI_Inpainting_Lab.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error loading page');
        
        // 获取 Zeabur 注入的环境变量
        const apiKey = process.env.API_KEY || '';
        const apiRegion = process.env.API_REGION || 'bj';
        
        // 构造注入脚本：将环境变量赋值给 window._env_
        const injection = `
        <script>
            window._env_ = {
                API_KEY: "${apiKey}",
                API_REGION: "${apiRegion}"
            };
        </script>
        `;
        
        // 将脚本插入到 <head> 标签之后，确保比所有代码都先执行
        const result = data.replace('<head>', `<head>${injection}`);
        
        // 发送给浏览器
        res.send(result);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});