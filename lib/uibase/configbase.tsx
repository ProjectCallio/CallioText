
export type {
    TypographyConfig , 
    MyPartial , 
}

// 这个泛型递归地将每个成员都设为可选的。
type MyPartial<T> = { [k in keyof T]?: MyPartial<T[k]> }

/** 定义字体样式的主题。 */
interface TypographyConfig {
    /** 字体。 */
    fontFamily: string

    /** 字号。 */
    fontSize: string

    /** 全局的行高。注意行高为数字时指的是字体大小的倍数。 */
    lineHeight : string

    /** 全局的字符间距。 */
    lineSpacing: string

    /** 全局的粗细。 */
    fontWeight: number 
}

