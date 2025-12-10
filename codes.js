// 激活码验证 - 后端API版本
// 由知愈心理测评社原创设计
// 激活码现在存储在服务器端，更加安全

// 调用后端API验证激活码
async function validateCode(code) {
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code.trim() })
        });

        const data = await response.json();
        
        if (data.success && data.valid) {
            // 检查激活码是否已被使用
            const usedCodes = JSON.parse(localStorage.getItem('usedCodes') || '[]');
            const upperCode = code.trim().toUpperCase();
            
            if (usedCodes.includes(upperCode)) {
                return { valid: false, message: "⚠️ 此激活码已被使用" };
            }
            
            return { valid: true, message: "✅ 验证成功" };
        } else {
            return { valid: false, message: data.message || "❌ 激活码无效" };
        }
    } catch (error) {
        console.error('验证失败:', error);
        return { valid: false, message: "❌ 网络错误，请检查连接后重试" };
    }
}

// 标记激活码为已使用
function markCodeAsUsed(code) {
    const upperCode = code.trim().toUpperCase();
    const usedCodes = JSON.parse(localStorage.getItem('usedCodes') || '[]');
    usedCodes.push(upperCode);
    localStorage.setItem('usedCodes', JSON.stringify(usedCodes));
}
