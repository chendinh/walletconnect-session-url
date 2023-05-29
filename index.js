import QueryString from 'query-string'
import crypto from 'crypto-js'

const DEFAULT_PASSWORD = 'CHENDINH'

const encryptBackupFileContent = (value, pass = DEFAULT_PASSWORD) => {
  try {
    return crypto.AES.encrypt(value.toString(), pass.toString()).toString()
  } catch (error) {
    console.log('error encryptBackupFileContent', error)
    return false
  }
}

const decryptBackupFileContent = (value, pass = DEFAULT_PASSWORD) => {
    try {
      return crypto.AES.decrypt(value.toString(), pass.toString()).toString(crypto.enc.Utf8)
    } catch (error) {
      return false
    }
}

export const encryptSessionObject = (objectSession, addressUser, chainId, peerId, password = DEFAULT_PASSWORD) => {
      // objectSession is from connector.session by wallet connect v1
      // chainId's type is Number (ex: 1)
      // peerId's type is String (this is clientId of dapp or wallet. if you encode from wallet, your peerId must be clientId of dapp)
      // addressUser's type is String (0x...123)
      try {
        const objSession = objectSession
        objSession.connected = true
        objSession.address = addressUser
        objSession.chainId = chainId
        objSession.peerId = peerId
        const encodeStringSession = encryptBackupFileContent(QueryString.stringify(objSession), password)
        return encodeStringSession
      } catch (e) {
        return false
      }
}

export const decryptSessionObject = (encodeStringSession, clientMeta, peerMeta,  password = DEFAULT_PASSWORD) => {
    // encodeStringSession is encoded
    // clientMeta's type is Object (this is clientMeta of dapp or wallet. if you encode from wallet, your clientMeta must be peerMeta of dapp)
    // peerMeta's type is Object (this is peerMeta of dapp or wallet. if you encode from wallet, your peerMeta must be clientMeta of dapp)

    const urlObject = encodeStringSession.split('?')
    const queryKey = urlObject[1].split('=')

    const queryKeyString = queryKey[1]
    if (!queryKeyString) {
      return false
    } else {
      const decodeURIString = decodeURI(queryKeyString)
      const decodeAutoWCKey = decryptBackupFileContent(decodeURIString, password)
      const objSessionTemp = QueryString.parseUrl(`?${decodeAutoWCKey}`).query

      return {
        accounts: [objSessionTemp.address],
        bridge: objSessionTemp.bridge,
        chainId: Number(objSessionTemp.chainId),
        clientId: objSessionTemp.clientId,
        clientMeta: clientMeta || {
            name: 'AppNAME clientMeta',
            url: 'https://yourdomaindapp.com',
            icons: ['https://ipfs.appicon.png'],
            description: 'good morning'
        },
        connected: true,
        handshakeId: objSessionTemp.handshakeId,
        handshakeTopic: objSessionTemp.handshakeTopic,
        key: objSessionTemp.key,
        peerId: objSessionTemp.peerId,
        peerMeta: peerMeta || {
            name: 'AppNAME peerMeta',
            url: 'https://yourdomaindapp.com',
            icons: ['https://ipfs.appicon.png'],
            description: 'good morning'
        }
      }
    }
}


export const urlWithEncodeSession = (urlDapp, encodeStringSession) => {
    if (!encodeStringSession || !urlDapp || (urlDapp && urlDapp.length === 0) || (encodeStringSession && encodeStringSession.length === 0)) {
        return false
    } else {
        const customUrl = encodeURI(`${urlDapp}?autoWCKey=${encodeStringSession}`) 
        return customUrl
    }
}