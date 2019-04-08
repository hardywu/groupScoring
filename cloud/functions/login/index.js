const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const { nickName } = event
  try {
    let { data } = await db.collection('users').doc(wxContext.OPENID).get()
    return data
  } catch (e) {
    try {
      await db.collection('users').add({
        data: {
          _id: wxContext.OPENID,
          groups: [],
          nickName,
        },
      })
      let { data } = await db.collection('users').doc(wxContext.OPENID).get()
      return data
    } catch (error) {
      console.log(e)
    }
  }
}
