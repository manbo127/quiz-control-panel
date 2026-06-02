export const gameState = {

  mode: 'home',

  currentTeam: 1,

  selectedTeam: null,

  currentQuestion: null,

  selectedAnswers: [],

  answerSubmitted: false,

  teams: Array.from({length:9}, (_,i)=>({
    id:i+1,
    name:`队伍${i+1}`,
    score:0,
    answered:0
  })),

  answerQuestions: [
    {
      id:1,
      question:'中国的首都是哪里？',
      options:['上海','北京','广州','深圳'],
      answer:['北京'],
      used:false,
      type:'single'
    },
    {
      id:2,
      question:'HTML 是什么？',
      options:['编程语言','标记语言','数据库','服务器'],
      answer:['标记语言'],
      used:false,
      type:'single'
    }
  ],

  buzzerQuestions:[
    {
      id:101,
      question:'地球是第几颗行星？',
      options:['第一','第二','第三','第四'],
      answer:['第三'],
      used:false,
      type:'single'
    }
  ],

  riskQuestions:{
    20:[
      {
        id:201,
        question:'下面哪些属于前端技术？',
        options:['HTML','CSS','MySQL','JavaScript'],
        answer:['HTML','CSS','JavaScript'],
        used:false,
        type:'multiple',
        score:20
      }
    ]
  }
}
