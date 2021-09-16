const cheerio = require("cheerio");
const crypto = require("crypto");
const nodeFetch = require("node-fetch");
const fetch = require("fetch-cookie/node-fetch")(nodeFetch);
const { URLSearchParams } = require("url");

/**
 * 每日健康打卡nodejs版本
 * node-version: >=12
 * @dependency cheerio
 * @dependency node-fetch
 * @dependency fetch-cookie
 */

/**
 * 打卡脚本执行主函数
 * @param {string} username nju学号
 * @param {string} password 统一认证登录密码
 * @returns 打卡信息
 */
async function main(username, password) {
  const urlLogin = "https://authserver.nju.edu.cn/authserver/login";
  const urlList =
    "http://ehallapp.nju.edu.cn/xgfw/sys/yqfxmrjkdkappnju/apply/getApplyInfoList.do";
  const urlApply =
    "http://ehallapp.nju.edu.cn/xgfw/sys/yqfxmrjkdkappnju/apply/saveApplyInfos.do";

  // login
  const response = await get(urlLogin);
  const $ = cheerio.load(await response.text());
  const salt = $("#pwdDefaultEncryptSalt").attr("value");
  console.log(salt);
  const dataLogin = {
    username: username,
    password: encryptAES(password, salt),
    lt: $('[name="lt"]').attr("value"),
    dllt: "userNamePasswordLogin",
    execution: $('[name="execution"]').attr("value"),
    _eventId: $('[name="_eventId"]').attr("value"),
    rmShown: $('[name="rmShown"]').attr("value"),
  };
  await post(urlLogin, dataLogin);

  // list
  const content = await (await get(urlList)).json();

  // apply
  let data = {};
  for (let i = 0; content["data"] && i < content["data"].length; i++) {
    if (content["data"][i]["TJSJ"]) {
      data = content["data"][i];
      break;
    }
  }
  data["WID"] = content["data"][0]["WID"];
  const fields = [
    "WID",
    "CURR_LOCATION",
    "IS_TWZC",
    "IS_HAS_JKQK",
    "JRSKMYS",
    "JZRJRSKMYS",
  ];
  const resultUrl = `${urlApply}?${fields
    .map((key) => `${key}=${encodeURI(data[key])}`)
    .join("&")}`;
  console.log(resultUrl);
  const result = await get(resultUrl);

  const message = await result.json();
  message["location"] = data["CURR_LOCATION"];
  console.log(message);
  return message;
}
/**
 * AES encryption
 * @param {string} _p0 data
 * @param {string} _p1 password
 * @returns encrypted
 */
function encryptAES(_p0, _p1) {
  const $_chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  const _chars_len = $_chars.length;
  function _rds(len) {
    let retStr = "";
    for (i = 0; i < len; i++) {
      retStr += $_chars.charAt(Math.floor(Math.random() * _chars_len));
    }
    return retStr;
  }
  function _gas(data, key0, iv0) {
    const cipher = crypto.createCipheriv("aes-128-cbc", key0, iv0);
    let encrypted = cipher.update(data, "utf-8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  }
  return _gas(_rds(64) + _p0, _p1, _rds(16));
}
/**
 * POST Method
 * @param {string} url url
 * @param {object} data post data json
 * @returns Response
 */
async function post(url, data) {
  const params = new URLSearchParams();
  for (const key in data) {
    params.append(key, data[key]);
  }
  const response = await fetch(url, {
    body: params,
    method: "POST",
    credentials: "include",
  });
  return response; // parses response to JSON
}
/**
 * GET Method
 * @param {string} url url
 * @returns Response
 */
async function get(url) {
  const response = await fetch(url, {
    credentials: "include",
    redirect: "error",
  });
  return response; // raw response
}
