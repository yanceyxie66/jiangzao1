const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 1. 增加：允许解析较大的 JSON Body (因为图片 Base64 很大)
app.use(express.json({ limit: '50mb' }));

// 2. 增加：后端代理接口
app.post('/api/generate', async (req, res) => {
    const apiKey = process.env.API_KEY;
    const apiRegion = process.env.API_REGION || 'bj';

    if (!apiKey) {
        return res.status(500).json({ error: '服务端未配置 API Key' });
    }

    const baseUrl = apiRegion === 'sg' 
        ? 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
        : 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

    try {
        console.log("🚀 正在转发请求给阿里云...");
        
        // 使用 Node.js 原生 fetch (Node 18+) 发起请求
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-DashScope-WorkSpace': 'modal'
            },
            body: JSON.stringify(req.body) // 直接透传前端的数据
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ 阿里云报错:", data);
            return res.status(response.status).json(data);
        }

        console.log("✅ 生成成功，返回结果");
        res.json(data);

    } catch (error) {
        console.error("❌ 代理请求失败:", error);
        res.status(500).json({ error: '服务器内部代理错误: ' + error.message });
    }
});

// 3. 静态页面服务
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("❌ 读取文件失败:", err);
            return res.status(500).send(`Error loading page: ${err.message}`);
        }
        // 现在不需要注入 Key 给前端了，直接返回 HTML
        res.send(data);
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
