import Cookies from 'js-cookie'

const TokenKey = 'ZWYHD-Token'
const nickNameKey = 'ZWYHD-nickName'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setnickName(userName) {
  return Cookies.set(nickNameKey, userName)
}

export function getnickName() {
  return Cookies.get(nickNameKey)
}

export function removenickName() {
  return Cookies.remove(nickNameKey)
}
