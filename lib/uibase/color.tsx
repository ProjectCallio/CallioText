import Color from "color"

export {
    light_grey
}

/** 这个函数把一个颜色变成一个浅灰色。 */
function light_grey(color: ReturnType<typeof Color>){
    const hsl = color.hsl()
    const saturation    = hsl.saturationl()
    const alpha         = hsl.alpha()
    const lightness     = hsl.lightness()
    return Color.hsl(
        hsl.hue(), 
        saturation > 8 ? 8 : saturation , 
        lightness > 70 ? lightness * 0.8 : lightness , 
    ).alpha(alpha > 0.3 ? 0.3 : alpha)
}
