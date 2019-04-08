// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { groupId, nickName } = event
  try {
    const data = await db.collection('memberships').add({
      data: {
        groupId,
        userId: wxContext.OPENID,
        nickName,
        score: 0,
        role: 'member',
      },
    })
    await db.collection('groups').doc(groupId).update({
      data: {
        membersCount: _.inc(1)
      }
    })
    return data
  } catch (e) {
    console.log(e)
  }
}
