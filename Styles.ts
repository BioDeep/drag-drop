namespace BioDeep.UI {

    export function stylingContainers(names: string[]): void {
        names.forEach(id => {
            var div = document.getElementById(id);
            var style = div.style;

            style.height = "250px";
            style.width = "166px";
            style.cssFloat = "left";
            style.border = "5px solid #000";
            style.position = "relative";
            style.marginTop = "0";
        })
    }

    export function stylingItems(keys: IEnumerator<string> | string[] | string): void {
        if (typeof keys == "string") {
            applyItemStyle(keys);
        } else if (Array.isArray(keys)) {
            keys.forEach(applyItemStyle);
        } else {
            keys.ForEach(applyItemStyle);
        }
    }

    export function applyItemStyle(id: string) {
        var a = document.getElementById(id);
        var style = a.style;

        style.textDecoration = "none";
        style.color = "#000";
        style.margin = "10px";
        style.width = "150px";
        style.border = "3px dashed #999";
        style.background = "#eee";
        style.padding = "10px";
        style.display = "block";
    }
}