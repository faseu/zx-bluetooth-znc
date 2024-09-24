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

export async function buf2hex(buffer) {
  const byteArray = new Uint8Array(buffer);
  console.log(byteArray);
  const hexParts = [];
  for (let i = 0; i < byteArray.length; i++) {
    // 将值转换为十六进制
    const hex = byteArray[i].toString(16);
    // 用零填充至两位数
    const paddedHex = ('00' + hex).slice(-2);
    // 添加到数组中
    hexParts.push(paddedHex);
  }
  console.log(hexParts);
  // 将所有十六进制值连接成一个字符串
  return hexParts.join('');
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
    byteArray.push((code >> 8) & 0xff); // 高位字节
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
