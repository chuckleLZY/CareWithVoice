
const questionsAudioUrls = [['https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E6%9C%80%E8%BF%91%E5%BC%80%E5%BF%83.mp3?sign=227f55661ddd40c7bc14205f9871148d&t=1600069308', 

'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E6%94%BE%E6%9D%BE.mp3?sign=f91ca66544ae8f73eb48130f4332d672&t=1600069209', 

'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E5%BD%B1%E5%93%8D.mp3?sign=220b7d588a363f4e84ee155bd7cd5f30&t=1600069769', 

'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E4%B8%8A%E4%B8%80%E6%AC%A1%E5%BC%80%E5%BF%83.mp3?sign=8a611b7db80b6c27cb85ddb93a27501a&t=1600069049', 

'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E4%BD%A0%E6%9C%80%E5%96%9C%E6%AC%A2%E5%AE%B6%E4%B9%A1%E7%9A%84%E4%BB%80%E4%B9%88%EF%BC%9F.mp3?sign=13346c68b6a2cc84b94161aea88b1229&t=1599705142', 

'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E6%9C%8B%E5%8F%8B.mp3?sign=bacbe311f9cb55e05f0d78a35ccd75e0&t=1600068919'],
  ['https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E4%B8%93%E4%B8%9A.mp3?sign=0247772b62f892fb72ab59d4e957683d&t=1600068641', 
  'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E5%AD%A9%E5%AD%90.mp3?sign=a67b2a3fc996287d35d3cc09ac928227&t=1600068477', 
  'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E5%B7%A5%E4%BD%9C.mp3?sign=9b44e528acdd14887368106b0d6bbed7&t=1600068567', 
  'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E5%AE%B6%E5%BA%AD.mp3?sign=c212f26a1bfd34ebf630e78a92b025c3&t=1600068351', 
  'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E6%B7%B1%E5%88%BB.mp3?sign=4ea9ce614f16c6eb23202565b11b7ae6&t=1600068246', 
  'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E4%BD%A0%E4%B8%80%E4%B8%AA%E4%BA%BA%E7%8B%AC%E5%A4%84%E7%9A%84%E6%97%B6%E5%80%99%E4%BC%9A%E5%81%9A%E4%BB%80%E4%B9%88%EF%BC%9F.mp3?sign=8a33503f1a66084e96d8a0519c2c06ad&t=1599706985'],
  ['https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E5%90%8E%E6%82%94.mp3?sign=8bdeb937823d8637acd16f0685e622f6&t=1600068111', 
  'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E4%BA%89%E5%90%B5.mp3?sign=2e0a3aec63a27cb71c06351cfbbf8357&t=1600067974', 
  'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E4%BD%A0%E7%BB%8F%E5%B8%B8%E5%A4%B1%E7%9C%A0%E5%90%97%EF%BC%9F%E5%A4%B1%E7%9C%A0%E7%9A%84%E6%97%B6%E5%80%99%E4%BC%9A%E6%9C%89%E4%BB%80%E4%B9%88%E6%84%9F%E8%A7%89%EF%BC%9F.mp3?sign=81cee44d76d5f6716bd10d87ca7eaca2&t=1599707035', 'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E6%9C%80%E8%BF%91%E4%B8%8D%E5%BC%80%E5%BF%83.mp3?sign=caa3030f100dfcec48543778722a840d&t=1600067837', 
  'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E7%94%9F%E6%B0%94%E5%A4%84%E7%90%86.mp3?sign=bd6d3447ecb12000377ad75d6426106e&t=1600067716', 
  'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/%E5%8F%AF%E4%BB%A5%E6%8F%8F%E8%BF%B0%E4%B8%80%E4%B8%8B%E4%BD%A0%E6%9C%80%E8%AE%A8%E5%8E%8C%E7%9A%84%E4%BA%BA%E6%88%96%E8%80%85%E4%BA%8B%E6%83%85%E5%90%97%EF%BC%9F.mp3?sign=02b9794ec2cc694d21e5af3e299a889c&t=1600067584']
]

const listening = 'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/listening.gif?sign=a247b2eaa3d12340530a66d0e86b09b0&t=1599703624'

const speaking = 'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/speaking.gif?sign=4064e76356c87bf4d47cf0c369a0ce78&t=1599713304'

const waiting = 'https://6465-development-689np-1300581457.tcb.qcloud.la/SpeechCollectionAssets/waiting.gif?sign=c515a9793c9f0ee1ff30d62c75cea5d4&t=1599703498'

export {
  questionsAudioUrls, listening, waiting, speaking
}