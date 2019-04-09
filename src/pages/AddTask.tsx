import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { Text, View, Label } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { AtButton, AtList, AtInputNumber, AtForm, AtInput } from 'taro-ui'


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
  name: string
  score: number
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
    navigationBarTitleText: '添加任务'
  }

  constructor() {
    super(...arguments)
    this.state = { name: '', score: 1, loading: false  }
  }

  async addTask() {
    this.setState({ loading: true })
    const { memberIdx } = this.$router.params
    const members = Taro.getStorageSync('members')
    const member = members[memberIdx]
    const { name, score } = this.state
    try {
      const { result } = await Taro.cloud.callFunction({
        name: 'addTask',
        data: { id: member._id, name, score, status: 'done' },
      })

      members[memberIdx] = result
      Taro.setStorageSync('members', members)
      Taro.navigateBack({ delta: 1 })
    } catch (error) {
      this.setState({ loading: false })
    }
  }

  render () {
    const { name, score, loading } = this.state

    return (
      <AtForm onSubmit={this.addTask}>
        <AtInput
          title='任务名'
          type='text'
          name='name'
          placeholder='值日'
          value={name}
          onChange={val => this.setState({ name: val })}
        />
        <View className='at-input'><View className='at-input__container'>
          <Label className='at-input__title'>任务积分</Label>

          <AtInputNumber
            type='number'
            size='lg'
            min={0}
            step={1}
            value={score}
            onChange={val => this.setState({ score: val })}
          />
        </View></View>

        <AtButton disabled={loading} loading={loading} type='primary' formType='submit'>创建</AtButton>
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
