// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  const { id, name, status, score } = event
  try {
    await db.collection('memberships').doc(id).update({
      data: {
        tasks: _.push([{name, status, score: Number(score)}]),
        score: _.inc(Number(score)),
      }
    })
    let { data } = await db.collection('memberships').doc(id).field({userId: false}).get()
    return data
  } catch (error) {
    console.log(error)
  }
}
