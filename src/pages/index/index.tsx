import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Navigator } from '@tarojs/components'
import { AtButton, AtList, AtListItem, AtLoadMore } from "taro-ui"
import { connect } from '@tarojs/redux'

import { add, minus, asyncAdd } from '../../actions/counter'
import { db } from '../../utils'
import './index.css'

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageStateProps = {
  counter: {
    num: number
  }
}

type PageDispatchProps = {
  add: () => void
  dec: () => void
  asyncAdd: () => any
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  add () {
    dispatch(add())
  },
  dec () {
    dispatch(minus())
  },
  asyncAdd () {
    dispatch(asyncAdd())
  }
}))
class Index extends Component {

    /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
    config: Config = {
    navigationBarTitleText: '首页'
  }

  constructor (props) {
    super(props)
    const me = Taro.getStorageSync('me')
    this.state = { groups: null, me }
  }

  async componentDidShow () {
    const { data } = await db.collection('groups').get()
    this.setState({ groups: data })
  }

  async handleClick(group) {
    const me = Taro.getStorageSync('me')
    const memberships = Taro.getStorageSync('myMemberships')
    try {
      if (!(memberships.map(m => m.groupId).includes(group._id))) {
        console.log('e', memberships)
        await Taro.cloud.callFunction({
          name: 'joinGroup',
          data: { groupId: group._id, nickName: me.nickName },
        })
      }
      Taro.setStorageSync('group', group)
      Taro.navigateTo({ url: '/pages/Group?id='+ group._id })
    } catch (error) {
      // this.setState({ loading: false })
      console.log('er', error)
    }
  }

  render () {
    const { groups } = this.state
    return (
      <View className='index'>
        {
          groups ?
          <AtList>
            {
              groups.map(
                group =>
                  <AtListItem
                    key={group.id}
                    title={group.name}
                    onClick={() => this.handleClick(group)}
                    note={group.desc} />
              )
            }
          </AtList>
          :
          <AtLoadMore status='loading' />
        }
        <Navigator url="/pages/GroupForm/index">
          <AtButton type='primary'>
            创建小组
          </AtButton>
        </Navigator>
      </View>
    )
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index as ComponentClass<PageOwnProps, PageState>
