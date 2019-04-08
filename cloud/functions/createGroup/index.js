// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { name, desc, nickName } = event
  try {
    const result = await db.collection('groups').add({
      data: {
        membersCount: 1,
        name,
        desc,
      }
    })
    await db.collection('memberships').add({
      data: {
        userId: wxContext.OPENID,
        groupId: result._id,
        nickName,
        role: 'creator',
        score: 0,
      }
    })
    return {
      groupId: result._id,
      nickName,
      role: 'creator',
      score: 0,
    }
  } catch (e) {
    console.log(e)
  }
}
