export type BossCityKey = 'xian' | 'beijing' | 'shanghai' | 'shenzhen' | 'hangzhou' | 'chengdu'

export interface BossJob {
  id: string
  title: string
  salary: string
  company: string
  city: string
  tags: string[]
  sourceRank: string
  url: string
}

export interface BossCitySnapshot {
  key: BossCityKey
  cityName: string
  sampledAt: string | null
  sampledJobs: number
  usableDetails: number
  status: 'synced' | 'pending'
  sourceLabel: string
  jobs: BossJob[]
}

const bossSearchUrl = (cityName: string, query = '运维工程师') =>
  `https://www.zhipin.com/web/geek/jobs?query=${encodeURIComponent(`${cityName} ${query}`)}`

export const defaultBossCityKey: BossCityKey = 'xian'

export const bossCitySnapshots: BossCitySnapshot[] = [
  {
    "key": "xian",
    "cityName": "西安",
    "sampledAt": "2026-06-11",
    "sampledJobs": 15,
    "usableDetails": 15,
    "status": "synced",
    "sourceLabel": "BOSS公开列表样本",
    "jobs": [
      {
        "id": "xian-1",
        "sourceRank": "#01",
        "title": "运维工程师 Devops",
        "salary": "薪资登录后可见",
        "company": "明鉴科技",
        "city": "西安·雁塔区·沣惠南路",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/219b09f9e7c9d9d503x82dm0FVtV.html"
      },
      {
        "id": "xian-2",
        "sourceRank": "#02",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "亿达信息",
        "city": "西安·雁塔区·鱼化寨",
        "tags": [
          "3-5年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/7662df8a363e2bc70nBy3dS4FlpT.html"
      },
      {
        "id": "xian-3",
        "sourceRank": "#03",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "停智慧",
        "city": "西安",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/eef43543f521deb11HB-3N-5EVFW.html"
      },
      {
        "id": "xian-4",
        "sourceRank": "#04",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "陕西云长",
        "city": "西安·雁塔区·沣惠南路",
        "tags": [
          "经验不限",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/07dda41aff1f0be81HJ_3dS5E1JT.html"
      },
      {
        "id": "xian-5",
        "sourceRank": "#05",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "联想弘扬",
        "city": "西安·雁塔区·鱼化寨",
        "tags": [
          "1-3年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/8e99742ce75683ce1H183N29FFtR.html"
      },
      {
        "id": "xian-6",
        "sourceRank": "#06",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "浩鲸科技",
        "city": "西安·未央区·未央路沿线",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/6089ebe0cf7791f71n173tq-F1pW.html"
      },
      {
        "id": "xian-7",
        "sourceRank": "#07",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "陕西绿都信息",
        "city": "西安·长安区·航天城",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/c041f603899f26101Xd90tS_EFZT.html"
      },
      {
        "id": "xian-8",
        "sourceRank": "#08",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "HeheMobi",
        "city": "西安·雁塔区·电子城",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/2665b0b3478460d003193Ny_ElVY.html"
      },
      {
        "id": "xian-9",
        "sourceRank": "#09",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "法本信息",
        "city": "西安·未央区·文景路",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/fe6e9726af06aa9d0nR609S4FVdX.html"
      },
      {
        "id": "xian-10",
        "sourceRank": "#10",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "鑫盛博海",
        "city": "西安·雁塔区·电子城",
        "tags": [
          "经验不限",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/fcc9fe874d5ed46c1Hx73d-0EVVS.html"
      },
      {
        "id": "xian-11",
        "sourceRank": "#11",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "深圳边缘脉冲信息科技",
        "city": "西安·雁塔区·电子城",
        "tags": [
          "1-3年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/b314248bc05f6c2303143Ni_ElBR.html"
      },
      {
        "id": "xian-12",
        "sourceRank": "#12",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "弘奎",
        "city": "西安·雁塔区·鱼化寨",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/3142177e31845c63031y0tq7GFdW.html"
      },
      {
        "id": "xian-13",
        "sourceRank": "#13",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "陕西鑫众为软件",
        "city": "西安·雁塔区·绿地世纪城",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/9ad851b3951641e11H1y3Nu1F1pX.html"
      },
      {
        "id": "xian-14",
        "sourceRank": "#14",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "陕西境云数据科技",
        "city": "西安·雁塔区·电子城",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/6fe425370440785303N-2tu7FFpR.html"
      },
      {
        "id": "xian-15",
        "sourceRank": "#15",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "翔石电子",
        "city": "西安·雁塔区·丈八",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/d914fe8a7124827603J-29W_F1JX.html"
      }
    ]
  },
  {
    "key": "beijing",
    "cityName": "北京",
    "sampledAt": "2026-06-11",
    "sampledJobs": 15,
    "usableDetails": 15,
    "status": "synced",
    "sourceLabel": "BOSS公开列表样本",
    "jobs": [
      {
        "id": "beijing-1",
        "sourceRank": "#01",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "法本",
        "city": "北京·海淀区·上地",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/45e834f7396bd5020nRz09i7GVVV.html"
      },
      {
        "id": "beijing-2",
        "sourceRank": "#02",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "格尔软件",
        "city": "北京",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/1ecbea59b00112d203Fz2Nu0EldW.html"
      },
      {
        "id": "beijing-3",
        "sourceRank": "#03",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "数据家",
        "city": "北京·朝阳区·望京",
        "tags": [
          "1-3年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/296e88e41b3fd3621XB-3dy_EVpS.html"
      },
      {
        "id": "beijing-4",
        "sourceRank": "#04",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "北京赢科",
        "city": "北京·海淀区·牡丹园",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/9f0d2cf1590d2f1e03N92d6-ElBS.html"
      },
      {
        "id": "beijing-5",
        "sourceRank": "#05",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "三维天地",
        "city": "北京·西城区·金融街",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/528729d8edda2a3f0ndy3dS7FlFT.html"
      },
      {
        "id": "beijing-6",
        "sourceRank": "#06",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "人民中科",
        "city": "北京·海淀区·学院路",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/671e89ff129e2b0a03F70tm5F1FT.html"
      },
      {
        "id": "beijing-7",
        "sourceRank": "#07",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "曜志科技",
        "city": "北京·海淀区·苏州桥",
        "tags": [
          "3-5年",
          "学历不限"
        ],
        "url": "https://www.zhipin.com/job_detail/26301d124a6669161HF-3dq8EFdW.html"
      },
      {
        "id": "beijing-8",
        "sourceRank": "#08",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "北京赛博云睿智能...",
        "city": "北京·昌平区·回龙观",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/5b4c828464b9525c0ndz3tW1ElpW.html"
      },
      {
        "id": "beijing-9",
        "sourceRank": "#09",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "森微特科技",
        "city": "北京·西城区·月坛",
        "tags": [
          "1-3年",
          "学历不限"
        ],
        "url": "https://www.zhipin.com/job_detail/f6ddb95a20c38a921nJ43t24EVRS.html"
      },
      {
        "id": "beijing-10",
        "sourceRank": "#10",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "北京金盘软件",
        "city": "北京·海淀区·上地",
        "tags": [
          "经验不限",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/4bdca372c276f35c1nB_0966GVFZ.html"
      },
      {
        "id": "beijing-11",
        "sourceRank": "#11",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "PureblueAI",
        "city": "北京·朝阳区·望京",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/be274a443948bf6a03x82dS5GFRX.html"
      },
      {
        "id": "beijing-12",
        "sourceRank": "#12",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "中科软",
        "city": "北京·石景山区·苹果园",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/c9b032472b4298a10nB8396-EFtZ.html"
      },
      {
        "id": "beijing-13",
        "sourceRank": "#13",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "稳准智能科技",
        "city": "北京·海淀区·学院路",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/c5d506c3372d9ebc031_2dW0FVFW.html"
      },
      {
        "id": "beijing-14",
        "sourceRank": "#14",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "北京乐游先锋网络科技",
        "city": "北京·海淀区·上地",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/30df101109dd0e6003N7392_EVZR.html"
      },
      {
        "id": "beijing-15",
        "sourceRank": "#15",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "国科离子",
        "city": "北京·海淀区·中关村",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/9b10ea2241a34d1b0nR72ty1GVpS.html"
      }
    ]
  },
  {
    "key": "shanghai",
    "cityName": "上海",
    "sampledAt": "2026-06-11",
    "sampledJobs": 15,
    "usableDetails": 15,
    "status": "synced",
    "sourceLabel": "BOSS公开列表样本",
    "jobs": [
      {
        "id": "shanghai-1",
        "sourceRank": "#01",
        "title": "运维工程师 / SRE 工程师",
        "salary": "薪资登录后可见",
        "company": "新数网络",
        "city": "上海·虹口区·临平路",
        "tags": [
          "3-5年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/48291fea6568ee6c0nB929u1EVZT.html"
      },
      {
        "id": "shanghai-2",
        "sourceRank": "#02",
        "title": "运维工程师 / DevOps 工程师",
        "salary": "薪资登录后可见",
        "company": "上海奇绩智峰智能科技",
        "city": "上海·徐汇区·漕河泾",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/a1dc4438dea9b85003192Nu5FVNQ.html"
      },
      {
        "id": "shanghai-3",
        "sourceRank": "#03",
        "title": "运维工程师 agv",
        "salary": "薪资登录后可见",
        "company": "烁逸电子",
        "city": "上海·嘉定区·菊园新区",
        "tags": [
          "经验不限",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/cf547afb76b22aff03dy29S4E1dR.html"
      },
      {
        "id": "shanghai-4",
        "sourceRank": "#04",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "上海云海智科信息科技",
        "city": "上海·闵行区·虹桥",
        "tags": [
          "在校/应届",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/d3412bc08a411ff403x429u9FFVW.html"
      },
      {
        "id": "shanghai-5",
        "sourceRank": "#05",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "天阳科技",
        "city": "上海·浦东新区·张江",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/e59501318f1dec020nB83Nq6F1RV.html"
      },
      {
        "id": "shanghai-6",
        "sourceRank": "#06",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "中电金信",
        "city": "上海·普陀区·曹杨",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/6e21e27e22d951261HB83N2_EVNZ.html"
      },
      {
        "id": "shanghai-7",
        "sourceRank": "#07",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "锐澳酒业",
        "city": "上海·浦东新区·张江",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/6e4ebea6f7b07ceb031-09m_FVJU.html"
      },
      {
        "id": "shanghai-8",
        "sourceRank": "#08",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "上海云盾智建工程...",
        "city": "上海·松江区·新桥",
        "tags": [
          "3-5年",
          "中专/中技"
        ],
        "url": "https://www.zhipin.com/job_detail/a418735b63f6bb911nxy3t66F1JW.html"
      },
      {
        "id": "shanghai-9",
        "sourceRank": "#09",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "上海赋拓物联网技...",
        "city": "上海·宝山区·通河",
        "tags": [
          "1-3年",
          "中专/中技"
        ],
        "url": "https://www.zhipin.com/job_detail/8994593f732281b91nJ43N64E1FW.html"
      },
      {
        "id": "shanghai-10",
        "sourceRank": "#10",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "文测科技",
        "city": "上海·浦东新区·迪士尼",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/0b0310f9ace3e01a03182dm7ElpS.html"
      },
      {
        "id": "shanghai-11",
        "sourceRank": "#11",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "盛视科技股份有限公司",
        "city": "上海·浦东新区·祝桥",
        "tags": [
          "经验不限",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/69e7cc5284e43f971XN92dq9GVZY.html"
      },
      {
        "id": "shanghai-12",
        "sourceRank": "#12",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "大汉三通",
        "city": "上海·浦东新区·金桥",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/e1f6b7b72f82faf403V42tS_EldV.html"
      },
      {
        "id": "shanghai-13",
        "sourceRank": "#13",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "诚迈科技",
        "city": "上海·浦东新区·张江",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/c6bdac6b6e9699780nB90ti_FlRS.html"
      },
      {
        "id": "shanghai-14",
        "sourceRank": "#14",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "量云之境",
        "city": "上海·虹口区·江湾",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/3bfa85f8ebc13160031-3Nm9GVNY.html"
      },
      {
        "id": "shanghai-15",
        "sourceRank": "#15",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "慧博云通",
        "city": "上海·浦东新区·陆家嘴",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/8c86dca631acb3f60nB92N-4FFtT.html"
      }
    ]
  },
  {
    "key": "shenzhen",
    "cityName": "深圳",
    "sampledAt": "2026-06-11",
    "sampledJobs": 15,
    "usableDetails": 15,
    "status": "synced",
    "sourceLabel": "BOSS公开列表样本",
    "jobs": [
      {
        "id": "shenzhen-1",
        "sourceRank": "#01",
        "title": "运维工程师 系统运维",
        "salary": "薪资登录后可见",
        "company": "大道至简",
        "city": "深圳·龙岗区·平湖",
        "tags": [
          "1-3年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/c2e3398cc872334703J52NS1GFdY.html"
      },
      {
        "id": "shenzhen-2",
        "sourceRank": "#02",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "中电金信",
        "city": "深圳·南山区·科技园",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/ca2b3ab451395e4b1Hd62dq6F1FR.html"
      },
      {
        "id": "shenzhen-3",
        "sourceRank": "#03",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "深圳曈毅",
        "city": "深圳·南山区·科技园",
        "tags": [
          "1年以内",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/ee37cfc91b3038ce03152d-0EFdS.html"
      },
      {
        "id": "shenzhen-4",
        "sourceRank": "#04",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "蕉下",
        "city": "深圳·南山区·科技园",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/fe17eb8b98f324010nB53Nq-FFtX.html"
      },
      {
        "id": "shenzhen-5",
        "sourceRank": "#05",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "拉满模型",
        "city": "深圳·龙华区·民治",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/3f5fd6bfb5b9117703Fz2tq5EVZZ.html"
      },
      {
        "id": "shenzhen-6",
        "sourceRank": "#06",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "深圳恒好",
        "city": "深圳·福田区·上步",
        "tags": [
          "1-3年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/dda51195ffb2fc221HN92924F1FQ.html"
      },
      {
        "id": "shenzhen-7",
        "sourceRank": "#07",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "海王星辰",
        "city": "深圳·南山区·科技园",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/e5a41b6da45d91a103B-2t26FVtQ.html"
      },
      {
        "id": "shenzhen-8",
        "sourceRank": "#08",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "乘乘智数",
        "city": "深圳·南山区·科技园",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/bc14d362602ba60a03x92tm0E1dR.html"
      },
      {
        "id": "shenzhen-9",
        "sourceRank": "#09",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "西舟鲤",
        "city": "深圳·南山区·科技园",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/1f1de03f04f2bd6403R-29m9EFZX.html"
      },
      {
        "id": "shenzhen-10",
        "sourceRank": "#10",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "盛视科技股份有限公司",
        "city": "深圳·南山区·科技园",
        "tags": [
          "经验不限",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/102b23a4439533301Xxy2t2_FFpX.html"
      },
      {
        "id": "shenzhen-11",
        "sourceRank": "#11",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "天锐计算机",
        "city": "深圳·龙岗区·坂田",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/512b48c053fbf5b81XVz09m8FlZZ.html"
      },
      {
        "id": "shenzhen-12",
        "sourceRank": "#12",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "赛意信息",
        "city": "深圳·坪山区·坪山",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/bfaec7f2830ca5c21HN53Nu0FlRR.html"
      },
      {
        "id": "shenzhen-13",
        "sourceRank": "#13",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "深圳市海伦温展览",
        "city": "深圳·罗湖区·万象城",
        "tags": [
          "1-3年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/637ef91a91a56c451H170t2_E1NW.html"
      },
      {
        "id": "shenzhen-14",
        "sourceRank": "#14",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "海星文化艺术有限公司",
        "city": "深圳·龙岗区·布吉",
        "tags": [
          "3-5年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/e111dc1b8c5190bd03V809q9GFFY.html"
      },
      {
        "id": "shenzhen-15",
        "sourceRank": "#15",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "思拟环保科技",
        "city": "深圳·福田区·福田中心",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/6297bc0d97d3737403d_2tq-FlNQ.html"
      }
    ]
  },
  {
    "key": "hangzhou",
    "cityName": "杭州",
    "sampledAt": "2026-06-11",
    "sampledJobs": 15,
    "usableDetails": 15,
    "status": "synced",
    "sourceLabel": "BOSS公开列表样本",
    "jobs": [
      {
        "id": "hangzhou-1",
        "sourceRank": "#01",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "保险师",
        "city": "杭州·西湖区·翠苑",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/c523ec8133abc7411nxz29u-EFRZ.html"
      },
      {
        "id": "hangzhou-2",
        "sourceRank": "#02",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "慧博云通",
        "city": "杭州·滨江区·长河",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/3b003bbc4f58e2980nB83t69EltT.html"
      },
      {
        "id": "hangzhou-3",
        "sourceRank": "#03",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "浙江凡中乐",
        "city": "杭州·上城区·望江",
        "tags": [
          "1-3年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/615684d41b65fc431HN-2tq_FVBZ.html"
      },
      {
        "id": "hangzhou-4",
        "sourceRank": "#04",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "特睿德弗",
        "city": "杭州·滨江区·西兴",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/54495c469244105903d909i6GFRY.html"
      },
      {
        "id": "hangzhou-5",
        "sourceRank": "#05",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "成思科技",
        "city": "杭州",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/a114043490f6df5c1HB93t-6GVNT.html"
      },
      {
        "id": "hangzhou-6",
        "sourceRank": "#06",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "CityDO",
        "city": "杭州·余杭区·未来科技城",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/0faf4e210417b9c903Ny3N2_EFpW.html"
      },
      {
        "id": "hangzhou-7",
        "sourceRank": "#07",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "浙江禹控",
        "city": "杭州·余杭区·未来科技城",
        "tags": [
          "经验不限",
          "高中"
        ],
        "url": "https://www.zhipin.com/job_detail/21c1c438bd9e20971HB409W6FlZZ.html"
      },
      {
        "id": "hangzhou-8",
        "sourceRank": "#08",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "豪波安全科技",
        "city": "杭州·临平区·塘栖",
        "tags": [
          "3-5年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/1f27a5609c5896661XJ62N65EVtS.html"
      },
      {
        "id": "hangzhou-9",
        "sourceRank": "#09",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "CHUU",
        "city": "杭州",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/e7295690aef77cff1nN_3ti8E1VZ.html"
      },
      {
        "id": "hangzhou-10",
        "sourceRank": "#10",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "卓越际联科技有限公司",
        "city": "杭州·西湖区·西溪",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/137566eab572bc1303V_39-8GVFQ.html"
      },
      {
        "id": "hangzhou-11",
        "sourceRank": "#11",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "诺领",
        "city": "杭州·余杭区·闲林",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/744d87d78febb03a03B629y9F1BU.html"
      },
      {
        "id": "hangzhou-12",
        "sourceRank": "#12",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "广域铭岛数字科技...",
        "city": "杭州·滨江区·浦沿",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/a4fe5e2dea2a4e2b03x83d69GVpR.html"
      },
      {
        "id": "hangzhou-13",
        "sourceRank": "#13",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "广曜数智",
        "city": "杭州·上城区·近江",
        "tags": [
          "经验不限",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/676346c78a6b9d6003R-3ty7EVpZ.html"
      },
      {
        "id": "hangzhou-14",
        "sourceRank": "#14",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "绿掌科技",
        "city": "杭州·萧山区·新街",
        "tags": [
          "1-3年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/c7126f7db817bdb803Fz3NS_EFZW.html"
      },
      {
        "id": "hangzhou-15",
        "sourceRank": "#15",
        "title": "运维工程师 (MJ000490)",
        "salary": "薪资登录后可见",
        "company": "观远数据",
        "city": "杭州·余杭区·五常",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/df73f3b40bea349c031y3ti5FFVU.html"
      }
    ]
  },
  {
    "key": "chengdu",
    "cityName": "成都",
    "sampledAt": "2026-06-11",
    "sampledJobs": 15,
    "usableDetails": 15,
    "status": "synced",
    "sourceLabel": "BOSS公开列表样本",
    "jobs": [
      {
        "id": "chengdu-1",
        "sourceRank": "#01",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "新希望地产",
        "city": "成都·锦江区·琉璃场",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/8446ccbf1674752603J53tW8EFVQ.html"
      },
      {
        "id": "chengdu-2",
        "sourceRank": "#02",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "众鹏科技",
        "city": "成都·武侯区·金融城",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/1871edd0cd930a5103x43ty0GVRQ.html"
      },
      {
        "id": "chengdu-3",
        "sourceRank": "#03",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "中科软",
        "city": "成都·锦江区·盐市口",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/cb43d82e3534d78d03x-3Nq1E1A~.html"
      },
      {
        "id": "chengdu-4",
        "sourceRank": "#04",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "瑞林星谷",
        "city": "成都·武侯区·石羊场",
        "tags": [
          "5-10年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/33aab92c6c4201d003x829i9EVZX.html"
      },
      {
        "id": "chengdu-5",
        "sourceRank": "#05",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "布尔文科技",
        "city": "成都·成华区·猛追湾",
        "tags": [
          "1-3年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/b44bb570a5c96cb31Hdy29i-EVpS.html"
      },
      {
        "id": "chengdu-6",
        "sourceRank": "#06",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "卓瑞特",
        "city": "成都·武侯区·中和",
        "tags": [
          "1-3年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/89565245a847185303J92NW8GVtY.html"
      },
      {
        "id": "chengdu-7",
        "sourceRank": "#07",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "盛视科技股份有限公司",
        "city": "成都",
        "tags": [
          "经验不限",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/e64d3f1641cff7761XN92du6F1FZ.html"
      },
      {
        "id": "chengdu-8",
        "sourceRank": "#08",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "华西公用",
        "city": "成都·武侯区·华西",
        "tags": [
          "经验不限",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/94f4242c64ce383b1nJ63dq6E1FV.html"
      },
      {
        "id": "chengdu-9",
        "sourceRank": "#09",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "成都极数链",
        "city": "成都·武侯区·中和",
        "tags": [
          "1-3年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/08445e0e99c8f2fd1nJ42d68FFJQ.html"
      },
      {
        "id": "chengdu-10",
        "sourceRank": "#10",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "法本",
        "city": "成都·武侯区·中和",
        "tags": [
          "3-5年",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/2c7d96ed1d649af90nBy3tS_E1dQ.html"
      },
      {
        "id": "chengdu-11",
        "sourceRank": "#11",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "众连心达",
        "city": "成都·武侯区·科华北路",
        "tags": [
          "经验不限",
          "大专"
        ],
        "url": "https://www.zhipin.com/job_detail/0f30f89dd6bb99363nR70t-_EVM~.html"
      },
      {
        "id": "chengdu-12",
        "sourceRank": "#12",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "成都高恪科技",
        "city": "成都·武侯区·省体育馆",
        "tags": [
          "经验不限",
          "高中"
        ],
        "url": "https://www.zhipin.com/job_detail/f5489bb23e2aebde1XR60t61EVRZ.html"
      },
      {
        "id": "chengdu-13",
        "sourceRank": "#13",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "集数",
        "city": "成都·双流区·华阳",
        "tags": [
          "经验不限",
          "学历不限"
        ],
        "url": "https://www.zhipin.com/job_detail/6f05acb608a84bd11HV939-8ElRZ.html"
      },
      {
        "id": "chengdu-14",
        "sourceRank": "#14",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "成都墨易智星科技",
        "city": "成都·武侯区·中和",
        "tags": [
          "3-5年",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/ee510c545c6415780nR63du7EFRZ.html"
      },
      {
        "id": "chengdu-15",
        "sourceRank": "#15",
        "title": "运维工程师",
        "salary": "薪资登录后可见",
        "company": "成都科汇",
        "city": "成都·武侯区·省体育馆",
        "tags": [
          "经验不限",
          "本科"
        ],
        "url": "https://www.zhipin.com/job_detail/41b1a81d34823dc91nF-29W0GVdY.html"
      }
    ]
  }
]

export const getBossCitySnapshot = (cityKey: BossCityKey) =>
  bossCitySnapshots.find((snapshot) => snapshot.key === cityKey) ?? bossCitySnapshots[0]

export const getBossSearchUrl = bossSearchUrl
