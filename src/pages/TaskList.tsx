import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtButton, AtList, AtListItem, AtAvatar, AtLoadMore } from 'taro-ui'


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
}

type PageOwnProps = {}

type PageState = {
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
    navigationBarTitleText: '完成任务表'
  }

  constructor() {
    super(...arguments)
    const { memberIdx } = this.$router.params
    const members = Taro.getStorageSync('members')
    const member = members[memberIdx]
    Taro.setNavigationBarTitle({ title: (member || {}).nickName || '' })
    this.state = { member }
  }

  componentDidShow() {
    const { memberIdx } = this.$router.params
    const members = Taro.getStorageSync('members')
    const member = members[memberIdx]
    this.setState({ member })
  }

  handleClick() {
    const { memberIdx } = this.$router.params
    Taro.navigateTo({
      url: '/pages/AddTask?memberIdx=' + memberIdx
    })
  }

  render () {
    const { member } = this.state

    return (
      <View>
        <AtButton onClick={this.handleClick}>添加任务</AtButton>
        <AtList>
          {
            (member.tasks || []).map(
              (task, idx)=>
                <AtListItem
                  key={idx}
                  extraText={`分数： ${task.score}`}
                  title={task.name}
                />
            )
          }

        </AtList>
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
