quiz-control-panel/
│
├── index.html               # 单页面入口
│
├── css/
│   ├── global.css           # 全局样式
│   ├── layout.css           # 页面布局（题目区 + 计分板）
│   ├── question.css         # 题目样式（单选、多选）
│   ├── scoreboard.css       # 计分板样式
│   └── buttons.css          # 按钮样式
│
├── js/
│   ├── gameState.js         # 全局状态管理
│   ├── questionEngine.js    # 题目抽取、去重、显示逻辑
│   ├── scoreEngine.js       # 分数计算、排行榜更新
│   ├── uiController.js      # 页面显示控制（切换模块、显示提示）
│   ├── main.js              # 入口脚本，初始化比赛
│   └── utils.js             # 公共工具函数
│
├── assets/
│   ├── images/              # 图标、队伍头像等
│   └── sounds/              # 正确/错误提示音（可选）
│
└── README.md