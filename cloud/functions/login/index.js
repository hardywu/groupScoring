const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const { nickName } = event
  let user = null
  try {
    let { data } = await db.collection('users').field({_id: true})
                   .where({_openid: wxContext.OPENID}).get()
    user = data[0]
    if (!user) {
      user = await db.collection('users').add({
        data: {
          _openid: wxContext.OPENID,
          nickName,
        },
      })
    }
  } catch (error) {
    console.log(e)
  }

  try {
    let { data } = await db.collection('memberships')
                                .field({groupId: true, role: true, score: true})
                                .where({userId: wxContext.OPENID}).get()
    return { _id: user._id, memberships: data }
  } catch (error) {
    console.log(error)
  }
}
