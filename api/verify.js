// 后端激活码验证 API
// 部署在 Vercel Serverless Function

export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: '请求方法不允许' 
        });
    }

    try {
        // 获取前端发送的激活码
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ 
                success: false, 
                message: '请输入激活码' 
            });
        }

        // 从环境变量中获取激活码列表
        const validCodes = process.env.ACTIVATION_CODES 
            ? process.env.ACTIVATION_CODES.split(',').map(c => c.trim().toUpperCase())
            : [];

        // 转换为大写进行比较（不区分大小写）
        const upperCode = code.trim().toUpperCase();

        // 检查激活码是否有效
        const isValid = validCodes.includes(upperCode);

        if (!isValid) {
            return res.status(200).json({ 
                success: false,
                valid: false,
                message: '❌ 激活码无效，请检查后重试' 
            });
        }

        // 验证成功
        return res.status(200).json({ 
            success: true,
            valid: true,
            message: '✅ 验证成功',
            code: upperCode
        });

    } catch (error) {
        console.error('验证错误:', error);
        return res.status(500).json({ 
            success: false, 
            message: '服务器错误，请稍后重试' 
        });
    }
}

