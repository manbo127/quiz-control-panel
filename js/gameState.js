export const gameState = {

  mode: 'home',

  currentTeam: 1,
  currentAnswerTeam: 1,
  maxAnswerQuestions: 5,
  selectedTeam: null,
  selectedRisk: null,
  currentQuestion: null,
  selectedAnswers: [],
  answerSubmitted: false,

  teams: [
    { id: 1, name: '长度检测室', score: 0, answerCount: 0 },
    { id: 2, name: '热学检测室', score: 0, answerCount: 0 },
    { id: 3, name: '力学检测室', score: 0, answerCount: 0 },
    { id: 4, name: '电磁检测室', score: 0, answerCount: 0 },
    { id: 5, name: '流量检测室', score: 0, answerCount: 0 },
    { id: 6, name: '化学检测室', score: 0, answerCount: 0 },
    { id: 7, name: '报警器检测室', score: 0, answerCount: 0 },
    { id: 8, name: '医疗检测室', score: 0, answerCount: 0 },
    { id: 9, name: '衡器检测室', score: 0, answerCount: 0 }
  ],

  // ===== 必答题 30道 =====
  answerQuestions: Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    question: `必答题${i + 1}：这是题目内容？`,
    options: ['A选项', 'B选项', 'C选项', 'D选项'],
    answer: ['A选项'],
    used: false,
    type: 'single'
  })),

  // ===== 抢答题 20道 =====
  buzzerQuestions: Array.from({ length: 20 }, (_, i) => ({
    id: i + 101,
    question: `抢答题${i + 1}：这是题目内容？`,
    options: ['A选项', 'B选项', 'C选项', 'D选项'],
    answer: ['B选项'],
    used: false,
    type: 'single'
  })),

  // ===== 风险题（简述题） =====
  riskQuestions: {
    20: [
      { id: 201, question: '风险题1：请简述水循环的基本过程', answer: ['蒸发、凝结、降水、径流'], used: false, score: 20 },
      { id: 202, question: '风险题2：请说出地球的三大圈层', answer: ['地壳、大气层、水圈'], used: false, score: 20 },
      { id: 203, question: '风险题3：描述光合作用的基本过程', answer: ['光合作用产生葡萄糖和氧气'], used: false, score: 20 }
    ],
    30: [
      { id: 204, question: '风险题4：简述光合作用的化学方程式', answer: ['6CO2 + 6H2O → C6H12O6 + 6O2'], used: false, score: 30 },
      { id: 205, question: '风险题5：描述DNA的基本结构', answer: ['双螺旋结构，由核苷酸组成'], used: false, score: 30 }
    ],
    40: [
      { id: 206, question: '风险题6：解释相对论的核心原理', answer: ['时间和空间相对性，质能方程 E=mc²'], used: false, score: 40 },
      { id: 207, question: '风险题7：简述量子力学的不确定性原理', answer: ['位置和动量不能同时精确测量'], used: false, score: 40 }
    ]
  }

};