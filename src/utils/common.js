/**
 * string 转 Int8Array
 */
export function string2Int8Array(str) {
  // 创建一个与字符串长度相同的 Int8Array
  const int8Array = new Int8Array(str.length);

  // 将字符串的每个字符转换为其对应的字符编码（字符码）
  for (let i = 0; i < str.length; i++) {
    int8Array[i] = str.charCodeAt(i);
  }

  return int8Array;
}

/**
 * Int8Array 转 string
 */
export async function int8Array2String(int8Array) {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(int8Array);
}

// export const string2HexArray = (str) => {
//   // 将字符串的每个字符转换为其对应的字符编码，并转换为十六进制
//   const hexArray = [];
//   for (let i = 0; i < str.length; i++) {
//     // 将字符的编码转换为16进制，保证每个字符用两位表示
//     hexArray.push(str.charCodeAt(i).toString(16).padStart(2, '0'));
//   }
//   // 创建 ArrayBuffer
//   const buffer = new ArrayBuffer(hexArray.length);
//   const view = new Uint8Array(buffer);
//
//   // 将字节数组填充到 Uint8Array 视图中
//   for (let i = 0; i < hexArray.length; i++) {
//     view[i] = hexArray[i];
//   }
//   return buffer;
// };
export const string2HexArray = (str) => {
  const byteArray = [];

  // 将每个字符转换为 UTF-16 编码的字节
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    byteArray.push(code & 0xff); // 低位字节
  }

  // 创建 ArrayBuffer
  const buffer = new ArrayBuffer(byteArray.length);
  const view = new Uint8Array(buffer);

  // 填充 ArrayBuffer
  for (let i = 0; i < byteArray.length; i++) {
    view[i] = byteArray[i];
  }
  console.log(arrayBufferToString(buffer));
  console.log(arrayBufferToHex(buffer));
  return buffer;
};

export function arrayBufferToString(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let str = '';

  // 将每个字节转换回字符
  for (let i = 0; i < uint8Array.length; i++) {
    str += String.fromCharCode(uint8Array[i]);
  }

  return str;
}

export function arrayBufferToHex(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ');
}

export function incrementSixthCharacter(str) {
  if (str.length < 6) {
    return str; // 如果字符串长度小于6，直接返回原字符串
  }

  // 提取第六位字符
  const sixthChar = str[5];

  // 判断第六位字符是否为数字
  if (!isNaN(sixthChar)) {
    // 将其转换为数字并加1
    const incrementedChar = (parseInt(sixthChar, 10) - 1) % 10; // % 10 用于处理加1后大于9的情况
    // 构造新的字符串
    return str.substring(0, 5) + incrementedChar + str.substring(6);
  } else {
    // 如果第六位不是数字，返回原字符串
    return str;
  }
}
