namespace BioDeep.UI {

    /**
     * 对拖拽对象的容器添加样式
    */
    export function stylingContainers(names: string[]): void {
        names.forEach(id => {
            var div = document.getElementById(id);
            var style = div.style;

            style.height = "auto";
            style.width = "100%";
            style.cssFloat = "left";
            style.backgroundColor = "#d9edf7";
            style.borderRadius = "5px";
            style.position = "relative";
            style.marginTop = "0";
        })
    }

    /**
     * 对所拖拽的对象添加样式
    */
    export function stylingItems(keys: IEnumerator<string> | string[] | string): void {
        if (typeof keys == "string") {
            applyItemStyle(keys);
        } else if (Array.isArray(keys)) {
            keys.forEach(applyItemStyle);
        } else {
            keys.ForEach(applyItemStyle);
        }
    }

    /**
     * 对指定id编号的``<a>``元素应用样式
    */
    export function applyItemStyle(id: string) {
        var a = document.getElementById(id);
        var style = a.style;

        style.textDecoration = "none";
        style.width = "85%";
        style.background = "rgb(238, 238, 238)";
        style.padding = "10px";
        style.display = "block";
        style.color = "#fff";
        style.margin = "10px 0px 10px 5%";
        style.backgroundColor = "#1ea2e9";
        style.border = "1px solid #428bca";
        style.cursor = "pointer";
        style.borderRadius = "5px";
        style.fontSize = "13px";

    }
}