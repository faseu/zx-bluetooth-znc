/**
 * string 转 Int8Array
 */
export async function string2Int8Array(str) {
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

const str = '<CMD07:001:998>\r\n';

// 将字符串的每个字符转换为其对应的字符编码，并转换为十六进制
const hexArray = [];
for (let i = 0; i < str.length; i++) {
  // 将字符的编码转换为16进制，保证每个字符用两位表示
  hexArray.push(str.charCodeAt(i).toString(16).padStart(2, '0'));
}

// 将数组拼接成一个完整的十六进制字符串
const hexString = hexArray.join(' ');

console.log(hexString);
