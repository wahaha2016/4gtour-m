import filters from '../config/vue-filter-option'
import HomeNav from '../views/partials/HomeNav'
import Home from '../views/Home'
import Login from '../views/Login'
import DetailsNav from '../views/partials/ProductDetailsNav'
import Details from '../views/ProductDetails'
import DetailsInfo from '../views/ProductDetailsInfo'
import DetailsIntro from '../views/ProductDetailsIntro'
import Nav from '../views/partials/Nav'
import MyOrdersNav from '../views/partials/MyOrdersNav'
import MyOrders from '../views/MyOrders'
import OrderDetailsNav from '../views/partials/OrderDetailsNav'
import OrderDetails from '../views/OrderDetails'
import TicketSelect from '../views/TicketSelect'
import OrderConfirm from '../views/OrderConfirm'
import WeixinAuthNav from '../views/partials/WeixinAuthNav'
import WeixinAuth from '../views/WeixinAuth'
import ExperienceNav from '../views/partials/ExperienceNav'
import ExperienceFollowedList from '../views/ExperienceFollowingTrendList'
import ExperienceHotList from '../views/ExperienceHotList'
import ExperienceMineList from '../views/ExperienceMineList'
import ExperienceDetailsNav from '../views/partials/ExperienceDetailsNav'
import ExperienceDetails from '../views/ExperienceDetails'
import ExperienceDetailsFeeling from '../views/ExperienceDetailsFeeling'
import ExperienceDetailsRoute from '../views/ExperienceDetailsRoute'
import ExperienceDetailsFeelingAddNav from '../views/partials/ExperienceDetailsFeelingAddNav.vue'
import ExperienceDetailsFeelingAdd from '../views/ExperienceDetailsFeelingAdd.vue'
import ExperienceDetailsRouteAddNav from '../views/partials/ExperienceDetailsRouteAddNav.vue'
import ExperienceDetailsRouteAdd from '../views/ExperienceDetailsRouteAdd.vue'
import PickScenerySpotsNav from '../views/partials/PickScenerySpotsNav.vue'
import PickScenerySpots from '../views/PickScenerySpots.vue'
import MySelf from '../views/MySelf.vue'
import TANav from '../views/partials/TANav.vue'
import TA from '../views/TA.vue'
import TAInfo from '../views/partials/TAInfo.vue'
import GroupIndexNav from '../views/partials/GroupIndexNav.vue'
import GroupIndex from '../views/GroupIndex.vue'
import GroupAddNav from '../views/partials/GroupAddNav.vue'
import GroupAdd from '../views/GroupAdd.vue'
import GroupConvene from '../views/GroupConvene.vue'
import GroupConveneNav from '../views/partials/GroupConveneNav.vue'
import GroupConveningMember from '../views/GroupConveningMember.vue'
import GroupConveningMemberNav from '../views/partials/GroupConveningMemberNav.vue'
import GroupDetails from '../views/GroupDetails.vue'
import GroupDetailsNav from '../views/partials/GroupDetailsNav.vue'

export const attachFilters = (component, filterOption) => {
  component.filters = component.filters || {}
  Object.assign(component.filters, filters)
  return component
}

export default [
  // {
  //   path: '*', component: App
  // },
  {
    name: '首页',
    path: '/',
    components: {
      head: HomeNav,
      body: Home
    }
  },
  {
    name: '登录',
    path: '/login',
    components: {
      head: Nav,
      body: Login
    }
  },
  {
    name: '微信认证',
    path: '/weixin-auth',
    components: {
      head: WeixinAuthNav,
      body: WeixinAuth
    }
  },
  {
    name: '景点详情',
    path: '/details/:id',
    components: {
      head: DetailsNav,
      body: Details
    },
    children: [
      {
        name: '景点信息',
        path: 'info',
        components: {
          info: DetailsInfo
        }
      },
      {
        name: '景点介绍',
        path: 'intro',
        components: {
          intro: DetailsIntro
        }
      }
    ]
  },
  {
    name: '挑选门票',
    path: '/ticket-select/:id',
    components: {
      head: Nav,
      body: TicketSelect
    }
  },
  {
    name: '填写订单',
    path: '/order/:id,:quantity',
    components: {
      head: Nav,
      body: OrderConfirm
    }
  },
  {
    name: '我的订单',
    meta: { auth: true },
    path: '/my-orders',
    components: {
      head: MyOrdersNav,
      body: attachFilters(MyOrders, filters)
    }
  },
  {
    name: '我的订单-apicloud',
    path: '/my-orders-apicloud',
    components: {
      body: attachFilters(MyOrders, filters)
    }
  },
  {
    name: '订单详情',
    meta: { auth: true },
    path: '/order-details/:id',
    components: {
      head: OrderDetailsNav,
      body: attachFilters(OrderDetails, filters)
    }
  },
  {
    name: '关注见闻',
    meta: { auth: true },
    path: '/experience/follow',
    components: {
      head: ExperienceNav,
      body: ExperienceFollowedList
    }
  },
  {
    name: '热门见闻',
    path: '/experience/hot',
    components: {
      head: ExperienceNav,
      body: ExperienceHotList
    }
  },
  {
    name: '我的见闻',
    meta: { auth: true },
    path: '/experience/mine',
    components: {
      head: ExperienceNav,
      body: ExperienceMineList
    }
  },
  {
    name: '我的见闻-apicloud',
    path: '/experience/mine-apicloud',
    components: {
      body: ExperienceMineList
    }
  },
  {
    name: '见闻详情',
    path: '/experience-details/:id',
    components: {
      head: ExperienceDetailsNav,
      body: ExperienceDetails
    },
    children: [
      {
        name: '见闻-感受',
        path: 'feeling',
        components: {
          feeling: ExperienceDetailsFeeling
        }
      },
      {
        name: '见闻-路线',
        path: 'route',
        components: {
          route: ExperienceDetailsRoute
        }
      }
    ]
  },
  {
    name: '新增感受',
    meta: { auth: true },
    path: '/experience-add/feeling',
    components: {
      head: ExperienceDetailsFeelingAddNav,
      body: ExperienceDetailsFeelingAdd
    }
  },
  {
    name: '新增路线',
    meta: { auth: true },
    path: '/experience-add/route',
    components: {
      head: ExperienceDetailsRouteAddNav,
      body: ExperienceDetailsRouteAdd
    },
    children: [
      {
        name: '选择景点',
        path: '',
        components: {
          dialogHead: PickScenerySpotsNav,
          dialogBody: PickScenerySpots
        }
      }
    ]
  },
  {
    name: '转发',
    meta: { auth: true },
    path: '/experience-retweet/:id',
    components: {
      head: ExperienceDetailsFeelingAddNav,
      body: ExperienceDetailsFeelingAdd
    }
  },
  {
    name: 'MySelf-apicloud',
    path: '/myself-apicloud',
    components: {
      body: MySelf
    },
    children: [
      {
        name: '我的关注',
        path: 'following'
      },
      {
        name: '我的粉丝',
        path: 'follower'
      }
    ]
  },
  {
    name: 'TA',
    path: '/ta/:id',
    components: {
      head: TANav,
      body: TA
    },
    children: [
      {
        name: 'TA的发布',
        path: 'tweeted',
        alias: 'details',
        components: {
          info: TAInfo
        }
      },
      {
        name: 'TA的收藏',
        path: 'stared',
        components: {
          info: TAInfo
        }
      },
      {
        name: 'TA的关注',
        path: 'following',
        components: {
          info: TAInfo
        }
      },
      {
        name: 'TA的粉丝',
        path: 'follower',
        components: {
          info: TAInfo
        }
      }
    ]
  },
  {
    name: '团首页',
    path: '/group/index',
    components: {
      head: GroupIndexNav,
      body: GroupIndex
    }
  },
  {
    name: '添加团',
    path: '/group/add',
    components: {
      head: GroupAddNav,
      body: GroupAdd
    }
  },
  {
    name: '团详情',
    path: '/group/details/:id',
    components: {
      head: GroupDetailsNav,
      body: attachFilters(GroupDetails)
    }
  },
  {
    name: '召集团',
    path: '/group/convene/:id',
    components: {
      head: GroupConveneNav,
      body: attachFilters(GroupConvene)
    }
  },
  {
    name: '团队成员',
    path: '/group/convening-member',
    components: {
      head: GroupConveningMemberNav,
      body: GroupConveningMember
    }
  }
]
