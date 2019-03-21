import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtButton, AtForm, AtInput, AtTextarea } from 'taro-ui'

import { add, minus, asyncAdd } from '../../actions/counter'
import { db } from '../../utils'

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

type PageState = {
  name: string
}

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

  constructor() {
    super(...arguments)
    this.state = { name: '', desc: '' }
  }

  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  async formSubmit () {
    const { name, desc } = this.state
    await db.collection('groups').add({
      data: {name, desc},
    })
  }

  formReset = e => {
    console.log(e)
  }

  render () {
    const { name, desc } = this.state
    return (
      <AtForm onSubmit={this.formSubmit} onReset={this.formReset}>
        <View>
          小组名称
        </View>
        <AtInput
          type='text' name='name'
          placeholder='杭州发动机救援队'
          value={name}
          onChange={val => this.setState({ name: val })}
        />
        <AtTextarea
          value={desc}
          onChange={e => this.setState({ desc: e.target.value })}
          maxLength={200}
          placeholder='小组简介...'
        />
        <AtButton type='primary' formType='submit'>创建</AtButton>
      </AtForm>
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
