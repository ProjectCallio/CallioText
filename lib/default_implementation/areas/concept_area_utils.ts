/** 这个模块提供概念区的纯逻辑：键盘导航的几何计算与列表游标移动。
 * 不依赖 React，便于单独测试。
 * @module
*/

export type {
    ButtonRect ,
}
export {
    find_vertical_neighbor ,
    move_in_flat_list ,
    move_type ,
    normalize_cursor ,
    clamp ,
}

/** 一个按钮在屏幕上的位置。key 用来标识按钮（形如 `${type_idx}-${idx}`）。 */
interface ButtonRect {
    key: string
    top: number
    bottom: number
    left: number
    right: number
}

/** 判断两个矩形是否属于同一行（顶边接近）。 */
const ROW_TOLERANCE = 4

function center_x(r: ButtonRect){
    return (r.left + r.right) / 2
}

/** 在几何上寻找当前按钮上方或下方最近的按钮。
 * 规则：先找目标方向上最近的一行，再在该行中取水平中心最接近的按钮；
 * 目标方向上没有行时环绕到最远端的一行；全部按钮都在同一行时返回 null。
 * @param goal_x 参考横坐标。连续上下移动时传上一次的目标列位置，
 * 这样路过一个很短的行不会把水平位置带偏；不传则用当前按钮的中心。
*/
function find_vertical_neighbor(rects: ButtonRect[], cur_key: string, dir: "up" | "down", goal_x?: number): string | null{
    const cur = rects.find(r => r.key == cur_key)
    if(!cur){
        return null
    }

    const above = rects.filter(r => r.top < cur.top - ROW_TOLERANCE)
    const below = rects.filter(r => r.top > cur.top + ROW_TOLERANCE)

    // 向上取上方最近的一行（top 最大）；上方没有则环绕到最下面的一行（同样是 top 最大）。
    // 向下对称。
    let candidates: ButtonRect[]
    let target_top: number
    if(dir == "up"){
        candidates = above.length > 0 ? above : below
        if(candidates.length == 0){
            return null
        }
        target_top = Math.max(...candidates.map(r => r.top))
    }
    else{
        candidates = below.length > 0 ? below : above
        if(candidates.length == 0){
            return null
        }
        target_top = Math.min(...candidates.map(r => r.top))
    }

    const row = candidates.filter(r => Math.abs(r.top - target_top) <= ROW_TOLERANCE)
    const cx = goal_x ?? center_x(cur)
    let best: ButtonRect | null = null
    let best_dist = Infinity
    for(const r of row){
        const dist = Math.abs(center_x(r) - cx)
        if(dist < best_dist){
            best = r
            best_dist = dist
        }
    }
    return best ? best.key : null
}

/** 把 (类型下标, 类型内下标) 的游标在拉平的按钮序列上移动 delta 步，跨类型环绕。
 * counts 是每个类型的按钮数量，数量为 0 的类型被跳过。
 * 游标非法（比如概念清单变化后越界）时回到第一个按钮。
*/
function move_in_flat_list(counts: number[], cur: [number, number], delta: number): [number, number]{
    const flat: [number, number][] = []
    counts.forEach((count, type_idx) => {
        for(let idx = 0; idx < count; idx ++){
            flat.push([type_idx, idx])
        }
    })
    if(flat.length == 0){
        return cur
    }

    const pos = flat.findIndex(([t, i]) => t == cur[0] && i == cur[1])
    if(pos < 0){
        return flat[0]
    }
    const N = flat.length
    return flat[((pos + delta) % N + N) % N]
}

/** 把游标移到上一个或者下一个非空类型，类型内下标尽量保持（超界则取末尾）。 */
function move_type(counts: number[], cur: [number, number], delta: 1 | -1): [number, number]{
    const M = counts.length
    if(counts.every(c => c == 0)){
        return cur
    }
    let t = cur[0]
    for(let step = 0; step < M; step ++){
        t = ((t + delta) % M + M) % M
        if(counts[t] > 0){
            return [t, Math.min(cur[1], counts[t] - 1)]
        }
    }
    return cur
}

/** 把游标规范到合法范围：类型越界、类型为空、类型内下标越界时都落到最近的合法位置。 */
function normalize_cursor(counts: number[], cur: [number, number]): [number, number]{
    const M = counts.length
    if(M == 0 || counts.every(c => c == 0)){
        return [0, 0]
    }
    let [t, i] = cur
    if(t < 0 || t >= M){
        t = 0
    }
    if(counts[t] == 0){
        // 从头找第一个非空类型。
        t = counts.findIndex(c => c > 0)
    }
    if(i < 0 || i >= counts[t]){
        i = Math.max(0, Math.min(i, counts[t] - 1))
    }
    return [t, i]
}

/** 把数值限制在闭区间内。 */
function clamp(v: number, lo: number, hi: number): number{
    return Math.max(lo, Math.min(hi, v))
}
