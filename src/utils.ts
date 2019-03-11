if (!wx.cloud) {
  console.error('请使用 2.2.3 或以上的基础库以使用云能力')
} else {
  wx.cloud.init({
    traceUser: true,
    env: 'developme-f7bdb',
  })
}

export const db = wx.cloud.database()
