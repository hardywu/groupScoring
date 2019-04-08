// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  const { id } = event
  try {
    let { data: group } = await db.collection('groups').doc(id).get()
    let { data } = await db.collection('memberships')
                           .field({userId: false})
                           .where({groupId: id})
                           .get()
    return { ...group, memberships: data }
  } catch (error) {
    console.log(error)
  }
}
