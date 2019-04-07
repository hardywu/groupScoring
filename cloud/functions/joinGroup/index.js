// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { groupId } = event
  const _ = db.command
  try {
    await db.collection('users').doc(wxContext.OPENID).update({
      data: {
        groups: _.push([groupId]),
      },
    })
    return await db.collection('groups').doc(groupId).update({
      data: {
        members: _.push([{ id: wxContext.OPENID, score: 0 }])
      }
    })
  } catch (e) {
    console.log(e)
  }
}
