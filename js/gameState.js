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

  teams: Array.from({length:9}, (_,i)=>({
    id:i+1,
    name:`队伍${i+1}`,
    score:0,
    answerCount:0
  })),

  // ===== 必答题 30道 =====
  answerQuestions: Array.from({length:30}, (_,i)=>({
    id: i+1,
    question: `必答题${i+1}：这是题目内容？`,
    options: ['A选项','B选项','C选项','D选项'],
    answer: ['A选项'],
    used:false,
    type:'single'
  })),

  // ===== 抢答题 20道 =====
  buzzerQuestions: Array.from({length:20}, (_,i)=>({
    id: i+101,
    question: `抢答题${i+1}：这是题目内容？`,
    options: ['A选项','B选项','C选项','D选项'],
    answer: ['B选项'],
    used:false,
    type:'single'
  })),

  // ===== 风险题 10道 =====
  riskQuestions: {
    20: [
      { id:201, question:'风险题1：哪些属于前端技术？', options:['HTML','CSS','MySQL','JavaScript'], answer:['HTML','CSS','JavaScript'], used:false, type:'multiple', score:20 },
      { id:202, question:'风险题2：哪些是颜色属性？', options:['color','background','font-size','border'], answer:['color','background'], used:false, type:'multiple', score:20 },
      { id:203, question:'风险题3：下列哪些是编程语言？', options:['Python','HTML','Java','CSS'], answer:['Python','Java'], used:false, type:'multiple', score:20 }
    ],
    50: [
      { id:204, question:'风险题4：哪些属于数据库？', options:['MySQL','MongoDB','HTML','CSS'], answer:['MySQL','MongoDB'], used:false, type:'multiple', score:50 },
      { id:205, question:'风险题5：哪些是框架？', options:['Vue','React','Java','Python'], answer:['Vue','React'], used:false, type:'multiple', score:50 },
      { id:206, question:'风险题6：哪些是CSS布局属性？', options:['flex','grid','position','Python'], answer:['flex','grid','position'], used:false, type:'multiple', score:50 }
    ],
    100: [
      { id:207, question:'风险题7：哪些是前端打包工具？', options:['Webpack','Vite','React','Python'], answer:['Webpack','Vite'], used:false, type:'multiple', score:100 },
      { id:208, question:'风险题8：哪些是前端路由库？', options:['Vue-router','React-router','Node.js','CSS'], answer:['Vue-router','React-router'], used:false, type:'multiple', score:100 },
      { id:209, question:'风险题9：哪些是前端状态管理库？', options:['Vuex','Pinia','Python','MySQL'], answer:['Vuex','Pinia'], used:false, type:'multiple', score:100 },
      { id:210, question:'风险题10：哪些是浏览器渲染相关API？', options:['DOM','Canvas','MySQL','Node.js'], answer:['DOM','Canvas'], used:false, type:'multiple', score:100 }
    ]
  }

};