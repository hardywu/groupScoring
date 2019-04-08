import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtButton, AtAvatar, AtLoadMore } from 'taro-ui'


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
}

type PageDispatchProps = {
  add: () => void
  dec: () => void
  asyncAdd: () => any
}

type PageOwnProps = {}

type PageState = {
  name: string
  desc: string
  loading: boolean
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

class Index extends Component {

    /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
    config: Config = {
    navigationBarTitleText: '授权登录'
  }

  constructor() {
    super(...arguments)
    this.state = { loading: true, error: null }
  }

  async componentDidMount() {
    try {
      const { userInfo } = await Taro.getUserInfo()
      await this.login(userInfo)
    } catch (error) {
      this.setState({ error, loading: false })
    }
  }

  async login(userInfo) {
    const { result } = await Taro.cloud.callFunction({
      name: 'login',
      data: { nickName: userInfo.nickName },
    })
    console.log('er', result)
    Taro.setStorageSync('me', { ...userInfo, _id: result._id })
    Taro.setStorageSync('myMemberships', result.memberships)
    Taro.reLaunch({ url: '/pages/index/index' })
  }

  async goToFront({ detail }) {
    if (detail.userInfo) await this.login(detail.userInfo)
  }

  render () {
    const { loading } = this.state
    if (loading) return <AtLoadMore status="loading" />

    return (
      <View>
        <AtAvatar circle />
        <AtButton
          openType="getUserInfo"
          lang="zh_CN"
          onGetUserInfo={this.goToFront}
        >
          授权登录
        </AtButton>
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
