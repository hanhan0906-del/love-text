// 全局变量
let answers = [];

// 页面元素
const activationPage = document.getElementById('activationPage');
const consentPage = document.getElementById('consentPage');
const quizPage = document.getElementById('quizPage');
const loadingPage = document.getElementById('loadingPage');
const resultPage = document.getElementById('resultPage');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 绑定激活码验证
    const startBtn = document.getElementById('startBtn');
    const codeInput = document.getElementById('codeInput');
    
    startBtn.addEventListener('click', handleStartTest);
    codeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleStartTest();
        }
    });
    
    // 绑定知情同意书
    initConsent();
});

// 处理激活码验证
function handleStartTest() {
    const code = document.getElementById('codeInput').value.trim();
    const errorMsg = document.getElementById('errorMsg');
    
    errorMsg.textContent = '';
    
    if (!code) {
        showError('请输入激活码');
        return;
    }
    
    const result = validateCode(code);
    if (!result.valid) {
        showError(result.message);
        return;
    }
    
    markCodeAsUsed(code);
    
    // 进入知情同意书页面
    activationPage.classList.remove('active');
    consentPage.classList.add('active');
}

// 显示错误信息
function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = message;
    const codeInput = document.getElementById('codeInput');
    codeInput.style.animation = 'shake 0.5s';
    setTimeout(() => {
        codeInput.style.animation = '';
    }, 500);
}

// 添加抖动动画
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
        20%, 40%, 60%, 80% { transform: translateX(8px); }
    }
`;
document.head.appendChild(style);

// 初始化知情同意书
function initConsent() {
    const agreeBtn = document.getElementById('agreeBtn');
    
    agreeBtn.addEventListener('click', () => {
        consentPage.classList.remove('active');
        quizPage.classList.add('active');
        initQuiz();
    });
}

// 初始化答题页面
function initQuiz() {
    answers = new Array(QUESTIONS.length).fill(null);
    renderQuestions();
    updateProgress();
    renderProgressNav();
}

// 渲染所有题目
function renderQuestions() {
    const wrapper = document.getElementById('questionsWrapper');
    wrapper.innerHTML = '';
    
    QUESTIONS.forEach((question, index) => {
        const card = document.createElement('div');
        card.className = 'question-card unanswered';
        card.id = `question-${index}`;
        
        const header = document.createElement('div');
        header.className = 'question-header';
        
        const number = document.createElement('div');
        number.className = 'question-number';
        number.textContent = index + 1;
        
        const badge = document.createElement('span');
        badge.className = 'question-badge';
        badge.textContent = '必答';
        
        const title = document.createElement('div');
        title.className = 'question-title-text';
        title.textContent = question.question;
        
        header.appendChild(number);
        header.appendChild(badge);
        header.appendChild(title);
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = question.type === 'likert' ? 'question-options likert-options' : 'question-options';
        
        question.options.forEach((option, optIndex) => {
            const optBtn = document.createElement('button');
            optBtn.className = question.type === 'likert' ? 'likert-option' : 'option-button';
            
            if (question.type === 'choice') {
                const letter = document.createElement('span');
                letter.className = 'option-letter';
                letter.textContent = option.letter;
                optBtn.appendChild(letter);
                
                const text = document.createElement('span');
                text.textContent = option.text;
                optBtn.appendChild(text);
            } else {
                optBtn.textContent = option.text;
            }
            
            optBtn.onclick = () => selectAnswer(index, option.value, optBtn);
            optionsContainer.appendChild(optBtn);
        });
        
        card.appendChild(header);
        card.appendChild(optionsContainer);
        wrapper.appendChild(card);
    });
    
    // 更新总题数显示
    document.getElementById('totalCount').textContent = QUESTIONS.length;
}

// 选择答案
function selectAnswer(questionIndex, value, element) {
    answers[questionIndex] = value;
    
    // 更新选项样式
    const card = document.getElementById(`question-${questionIndex}`);
    const allOptions = card.querySelectorAll('.option-button, .likert-option');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    
    // 更新卡片状态
    card.classList.remove('unanswered');
    card.classList.add('answered');
    
    // 更新进度
    updateProgress();
    updateProgressNav();
    
    // 检查是否可以提交
    checkSubmitReady();
}

// 更新进度
function updateProgress() {
    const answeredCount = answers.filter(a => a !== null).length;
    const totalCount = QUESTIONS.length;
    const percentage = Math.round((answeredCount / totalCount) * 100);
    
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressPercentage').textContent = percentage + '%';
    document.getElementById('answeredCount').textContent = answeredCount;
}

// 渲染进度导航
function renderProgressNav() {
    const dotsContainer = document.getElementById('questionDots');
    dotsContainer.innerHTML = '';
    
    QUESTIONS.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot dot-unanswered';
        dot.textContent = index + 1;
        dot.onclick = () => {
            document.getElementById(`question-${index}`).scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        };
        dotsContainer.appendChild(dot);
    });
}

// 更新进度导航
function updateProgressNav() {
    const dots = document.querySelectorAll('.question-dots .dot');
    dots.forEach((dot, index) => {
        if (answers[index] !== null) {
            dot.classList.remove('dot-unanswered');
            dot.classList.add('dot-answered');
        } else {
            dot.classList.remove('dot-answered');
            dot.classList.add('dot-unanswered');
        }
    });
}

// 检查是否可以提交
function checkSubmitReady() {
    const submitBtn = document.getElementById('submitBtn');
    const submitNotice = document.getElementById('submitNotice');
    const allAnswered = answers.every(a => a !== null);
    
    submitBtn.disabled = !allAnswered;
    
    if (allAnswered) {
        submitNotice.textContent = '✨ 太棒了！所有题目已完成，点击查看结果';
        submitNotice.style.color = '#4CAF50';
        submitBtn.onclick = handleSubmit;
    } else {
        const remaining = answers.filter(a => a === null).length;
        submitNotice.textContent = `还有 ${remaining} 道必答题未完成`;
        submitNotice.style.color = '#ff4757';
    }
}

// 处理提交
function handleSubmit() {
    quizPage.classList.remove('active');
    loadingPage.classList.add('active');
    
    // 模拟加载过程
    let progress = 0;
    const loadingBar = document.getElementById('loadingBarFill');
    
    // 第一步
    setTimeout(() => {
        document.getElementById('step1').classList.add('active');
        progress = 33;
        loadingBar.style.width = progress + '%';
    }, 500);
    
    // 第二步
    setTimeout(() => {
        document.getElementById('step2').classList.add('active');
        progress = 66;
        loadingBar.style.width = progress + '%';
    }, 1500);
    
    // 第三步
    setTimeout(() => {
        document.getElementById('step3').classList.add('active');
        progress = 100;
        loadingBar.style.width = progress + '%';
    }, 2500);
        
    // 显示结果
    setTimeout(() => {
            showResult();
    }, 3500);
}

// 显示结果
function showResult() {
    loadingPage.classList.remove('active');
    resultPage.classList.add('active');
    
    const result = calculateResult(answers);
    renderResult(result);
}

// 渲染结果页面
function renderResult(result) {
    const content = document.getElementById('resultContent');
    content.innerHTML = '';
    
    const { typeName, resultType, typeScores, maxScore, topType } = result;
    
    // 1. 类型卡片
    const typeSection = createSection();
    typeSection.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 100px; margin-bottom: 20px;">${resultType.emoji}</div>
            <h2 style="font-size: 36px; color: ${resultType.color}; margin-bottom: 20px; font-weight: bold;">
                你的恋爱理想型是
            </h2>
            <div style="background: linear-gradient(135deg, ${resultType.color}20 0%, ${resultType.color}10 100%); 
                        padding: 25px 40px; border-radius: 50px; display: inline-block; margin-bottom: 30px;
                        border: 3px solid ${resultType.color};">
                <span style="font-size: 32px; color: ${resultType.color}; font-weight: bold;">
                    ${typeName}
                </span>
            </div>
            <div style="font-size: 18px; color: #666; margin-top: 20px;">
                💕 这是最适合你的恋爱类型 💕
            </div>
        </div>
    `;
    content.appendChild(typeSection);
    
    // 2. 类型详解
    const descSection = createSection();
    descSection.innerHTML = `
        <h2 style="color: ${resultType.color};">📖 类型详解</h2>
        <p style="font-size: 17px; line-height: 2; color: #333; text-indent: 2em;">
            ${resultType.description}
        </p>
    `;
    content.appendChild(descSection);
    
    // 3. 为什么喜欢这种类型
    const whySection = createSection();
    whySection.style.background = 'linear-gradient(135deg, #FFE5EC 0%, #FFF0F5 100%)';
    whySection.innerHTML = `
        <h2 style="color: ${resultType.color};">💭 为什么喜欢这种类型？</h2>
        <p style="font-size: 16px; line-height: 2; color: #333; text-indent: 2em; margin-top: 15px;">
            ${resultType.why}
        </p>
    `;
    content.appendChild(whySection);
    
    // 4. 符合的星座和MBTI
    const matchSection = createSection();
    matchSection.style.background = 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)';
    matchSection.innerHTML = `
        <h2 style="color: ${resultType.color};">⭐ 符合的星座 & MBTI</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-top: 25px;">
            <div style="background: #fff; padding: 25px; border-radius: 16px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 15px;">♈♉♊</div>
                <h3 style="color: ${resultType.color}; margin-bottom: 15px; font-size: 20px;">星座匹配</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                    ${resultType.zodiac.map(z => `
                        <span style="background: linear-gradient(135deg, ${resultType.color}20, ${resultType.color}10);
                                    color: ${resultType.color}; padding: 10px 20px; border-radius: 20px;
                                    font-size: 18px; font-weight: 600; border: 2px solid ${resultType.color};">
                            ${z}
                        </span>
                    `).join('')}
                </div>
            </div>
            <div style="background: #fff; padding: 25px; border-radius: 16px; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 15px;">🧠</div>
                <h3 style="color: ${resultType.color}; margin-bottom: 15px; font-size: 20px;">MBTI匹配</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                    ${resultType.mbti.map(m => `
                        <span style="background: linear-gradient(135deg, ${resultType.color}20, ${resultType.color}10);
                                    color: ${resultType.color}; padding: 10px 20px; border-radius: 20px;
                                    font-size: 18px; font-weight: 600; border: 2px solid ${resultType.color};">
                            ${m}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    content.appendChild(matchSection);
    
    // 5. 交往注意事项
    const tipsSection = createSection();
    tipsSection.innerHTML = `
        <h2 style="color: ${resultType.color};">⚠️ 交往注意事项</h2>
        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
            ${resultType.tips.map((tip, i) => `
                <div style="background: #FFF5F7; padding: 18px 20px; border-radius: 12px; border-left: 4px solid ${resultType.color};
                            display: flex; align-items: start; gap: 15px;">
                    <span style="background: ${resultType.color}; color: #fff; min-width: 30px; height: 30px;
                                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                                font-weight: bold; font-size: 14px;">${i+1}</span>
                    <span style="font-size: 16px; line-height: 1.8; color: #333;">${tip}</span>
                </div>
            `).join('')}
        </div>
    `;
    content.appendChild(tipsSection);
    
    // 6. 恋爱技巧
    const skillsSection = createSection();
    skillsSection.style.background = 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)';
    skillsSection.innerHTML = `
        <h2 style="color: ${resultType.color};">💡 恋爱技巧</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
            ${resultType.skills.map((skill, i) => `
                <div style="background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <div style="display: flex; align-items: start; gap: 12px;">
                        <span style="color: ${resultType.color}; font-size: 24px; flex-shrink: 0;">💫</span>
                        <span style="font-size: 15px; line-height: 1.8; color: #333;">${skill}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    content.appendChild(skillsSection);
    
    // 7. 适合送的礼物
    const giftsSection = createSection();
    giftsSection.innerHTML = `
        <h2 style="color: ${resultType.color};">🎁 适合送的礼物</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 25px;">
            ${resultType.gifts.map((gift, i) => `
                <div style="background: linear-gradient(135deg, #FFE5EC 0%, #FFF0F5 100%); 
                            padding: 25px; border-radius: 16px; text-align: center; border: 2px solid ${resultType.color}30;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🎁</div>
                    <p style="font-size: 15px; line-height: 1.8; color: #333; font-weight: 500;">
                        ${gift}
                    </p>
                </div>
            `).join('')}
        </div>
    `;
    content.appendChild(giftsSection);
    
    // 8. 恋爱必做的15件小事（通用）
    const todoSection = createSection();
    todoSection.style.background = 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)';
    todoSection.innerHTML = `
        <h2 style="color: #FF9800;">💑 恋爱必做的15件小事</h2>
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            无论是哪种理想型，这些甜蜜瞬间都能让你们的感情更加美好
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-top: 20px;">
            ${LOVE_TODO_LIST.map((todo, i) => `
                <div style="background: #fff; padding: 18px 22px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                            display: flex; align-items: center; gap: 15px; transition: transform 0.3s ease;">
                    <span style="background: linear-gradient(135deg, #FF9800, #FF5722); color: #fff; 
                                min-width: 38px; height: 38px; border-radius: 50%; display: flex; 
                                align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">
                        ${i+1}
                    </span>
                    <span style="font-size: 15px; line-height: 1.6; color: #333; font-weight: 500;">
                        ${todo}
                    </span>
                </div>
            `).join('')}
        </div>
    `;
    content.appendChild(todoSection);
    
    // 9. 评估信息和声明
    const infoSection = createSection();
    const now = new Date();
    infoSection.innerHTML = `
        <h2>ℹ️ 测评信息</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div>
                <div style="color: #666; margin-bottom: 5px;">测评类型</div>
                <div style="font-weight: bold; color: #333;">恋爱理想型画像测试</div>
            </div>
            <div>
                <div style="color: #666; margin-bottom: 5px;">完成时间</div>
                <div style="font-weight: bold; color: #333;">${now.toLocaleString('zh-CN')}</div>
            </div>
            <div>
                <div style="color: #666; margin-bottom: 5px;">回答题数</div>
                <div style="font-weight: bold; color: #333;">${QUESTIONS.length} 题</div>
            </div>
            <div>
                <div style="color: #666; margin-bottom: 5px;">测评来源</div>
                <div style="font-weight: bold; color: #FF1744;">知愈心理测评社</div>
            </div>
        </div>
        <div style="margin-top: 25px; padding: 25px; background: linear-gradient(135deg, #FFE5EC 0%, #FFF0F5 100%); 
                    border-radius: 12px; border: 2px solid #FFB6C1;">
            <p style="font-size: 15px; line-height: 2; color: #d32f2f; margin: 0;">
                <strong style="font-size: 17px;">🛡️ 原创研发 · 正版声明</strong><br><br>
                本测评由<strong style="color: #FF1744;">知愈心理测评社</strong>原创研发，所有题目、算法、分析维度及结果解读均为原创设计。
                <strong>严禁未经授权转载、复制、商用或二次改编。</strong>
                如发现盗版、抄袭、侵权等行为，我们将保留法律追诉权，依法追究侵权责任并索赔损失。<br><br>
                <strong>📌 测评说明：</strong>本测评结果仅供参考和自我了解使用，不能替代专业心理咨询。
                理想型会随着人生阶段和经历变化而改变，请以开放的心态看待结果。
                您的所有数据都安全地保存在本地设备上，我们不会收集或传输您的个人信息。
            </p>
        </div>
        <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 2px dashed #FFE5EC;">
            <p style="color: #999; font-size: 14px;">© 2025 <strong style="color: #FF1744;">知愈心理测评社</strong></p>
            <p style="color: #999; font-size: 13px; margin-top: 8px;">仅供教育和自我了解使用，不能替代专业心理健康服务。</p>
        </div>
    `;
    content.appendChild(infoSection);
}

// 获取类型信息
function getTypeInfo(type) {
    const typeInfos = {
        "霸道": { emoji: "👔", color: "#2C3E50" },
        "阳光": { emoji: "🐶", color: "#FFA500" },
        "爹系": { emoji: "🎩", color: "#8B4513" },
        "狐系": { emoji: "🦊", color: "#9B59B6" },
        "温柔": { emoji: "🌹", color: "#E91E63" },
        "高冷": { emoji: "❄️", color: "#546E7A" },
        "幽默": { emoji: "😄", color: "#FF5722" },
        "文艺": { emoji: "📚", color: "#795548" },
        "运动": { emoji: "⚽", color: "#4CAF50" },
        "暖男": { emoji: "💝", color: "#FF9800" }
    };
    return typeInfos[type] || { emoji: "💕", color: "#FF6B9D" };
}

// 创建结果区块
function createSection() {
    const section = document.createElement('div');
    section.className = 'result-section';
    return section;
}

