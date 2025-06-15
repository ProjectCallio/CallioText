export {
    click_all,
}

function click_all(element: HTMLElement | null) {
    // 先触发当前元素的点击
    element?.click()
    
    // 获取所有子元素
    const children = element?.children

    if(!children){
        return
    }
    
    // 递归触发每个子元素的点击
    for (let i = 0; i < children.length; i++) {
        click_all(children[i] as HTMLElement)
    }
}