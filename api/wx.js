const crypto = require('crypto');

module.exports = async (req, res) => {
    const token = 'shegongku'; // 必须与微信后台一致
    const { signature, timestamp, nonce, echostr } = req.query;

    // 1. 处理微信后台的配置验证 (GET 请求)
    if (req.method === 'GET') {
        const array = [token, timestamp, nonce].sort();
        const tempStr = array.join('');
        const hashCode = crypto.createHash('sha1').update(tempStr).digest('hex');
        return res.send(hashCode === signature ? echostr : 'fail');
    }

    // 2. 处理扫码后的自动回复 (POST 请求)
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            // 手动从 XML 字符串中提取关键 ID
            const fromUser = body.match(/<FromUserName><!\[CDATA\[(.*)\]\]>/)[1];
            const toUser = body.match(/<ToUserName><!\[CDATA\[(.*)\]\]>/)[1];
            
            // 生成随机验证码
            const accessCode = Math.floor(1000 + Math.random() * 9000);

            // 构建回复给微信的 XML
            const replyXML = `
                <xml>
                <ToUserName><![CDATA[${fromUser}]]></ToUserName>
                <FromUserName><![CDATA[${toUser}]]></FromUserName>
                <CreateTime>${Math.floor(Date.now()/1000)}</CreateTime>
                <MsgType><![CDATA[text]]></MsgType>
                <Content><![CDATA[【核心数据库指令】\n\n身份认证成功。\n您的临时接入令牌为：${accessCode}\n\n[WARNING] 请在网页终端输入。]]></Content>
                </xml>`;

            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send(replyXML);
        });
    }
};
