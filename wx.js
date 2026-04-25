// api/wx.js
const crypto = require('crypto');

module.exports = (req, res) => {
    const { signature, timestamp, nonce, echostr } = req.query;
    const token = 'shegongku'; // 这里填你准备在微信后台填的 Token

    // 1. 验证微信服务器（这是填 URL 成功的关键）
    const array = [token, timestamp, nonce].sort();
    const tempStr = array.join('');
    const hashCode = crypto.createHash('sha1').update(tempStr).digest('hex');

    if (req.method === 'GET') {
        if (hashCode === signature) {
            res.send(echostr);
        } else {
            res.send('fail');
        }
    } 
    // 2. 处理扫码后的自动回复
    else if (req.method === 'POST') {
        // 这里可以写逻辑，或者暂时留空，先让 URL 校验通过
        res.send('success');
    }
};