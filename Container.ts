/// <reference path="../../build/linq.d.ts" />

namespace BioDeep.UI {

    export class Container {

        private containers: Dictionary<string[]>;

        /**
         * 从这个属性获取得到拖拽的结果数据
        */
        public get Data(): object {
            var x = {};
            var table = this.containers;

            this.containers
                .Keys
                .ForEach(key => {
                    x[key] = table.Item(key);
                });

            return x;
        }

        /**
         * @param items 所需要进行拖拽的数据列表 是一个键值对，其中键名是资源的唯一标记，而键值则是用户界面显示使用的
         * @param containers 所接纳的容器对象的id编号列表
        */
        public constructor(
            items: Map<string, string>[],
            srcContainer: string,
            containers: string[]) {

            var union = [...containers];
            union.push(srcContainer);

            this.containers = new Dictionary<string[]>(TypeInfo.EmptyObject(union, () => (<string[]>[])));
            this.registerDatas(items, srcContainer);
            this.registerContainers(containers);
            this.registerContainers([srcContainer]);

            stylingContainers(containers);
            stylingItems(From(items).Select(id => id.key));
            stylingContainers([srcContainer]);
        }

        private registerContainers(names: string[]) {
            From(names)
                .Select(id => <HTMLElement>document.querySelector(`#${id}`))
                .ForEach(container => {
                    var ul = document.createElement("ul");
                    ul.id = `${container.id}-ul`;
                    container.appendChild(ul);

                    this.binEach(container, this.containers)
                });
        }

        /**
         * 为某一个指定的容器对象注册鼠标事件
        */
        private binEach(bin: HTMLElement, container: Dictionary<string[]>) {
            var key: string = bin.id;
            var dev = this;

            Linq.DOM.addEvent(bin, 'dragover', function (e) {
                if (e.preventDefault) {
                    // allows us to drop
                    e.preventDefault();
                }
                this.className = 'over';

                (<DragEvent>e).dataTransfer.dropEffect = 'copy';

                return false;
            });

            // to get IE to work
            Linq.DOM.addEvent(bin, 'dragenter', function (e) {
                this.className = 'over';
                return false;
            });

            Linq.DOM.addEvent(bin, 'dragleave', function () {
                this.className = '';
            });

            Linq.DOM.addEvent(bin, 'drop', function (e) {
                if (e.stopPropagation) {
                    // stops the browser from redirecting...why???
                    e.stopPropagation();
                }

                var event = <DragEvent>e;
                var strval: string = event.dataTransfer.getData('Text');

                // console.log(strval);

                var data = <Map<string, string>>JSON.parse(strval);
                var keyId: string = data.key;
                var el = document.getElementById(keyId);
                // var newItem = Container.createNewItem(data);
                var newItem = Container.createItem(data);

                el.parentNode.parentNode.removeChild(el.parentNode);
                // stupid nom text + fade effect
                bin.className = '';
                document.getElementById(`${bin.id}-ul`).appendChild(newItem.key);
                applyItemStyle(keyId);
                dev.registerItemDragEvent(newItem.value);
                
                container.Keys.ForEach(key => {
                    if (container.Item(key).indexOf(data.key) > -1) {
                        var list = From(container.Item(key))
                            .Where(id => id != data.key)
                            .ToArray();

                        container.Delete(key).Add(key, list);
                    }
                })

                // 在这里得到data数据之后，将数据添加进入对应的容器之中
                
                container.Item(key).push(data.key);
                localStorage.setItem("groupset", JSON.stringify(dev.Data));

                // console.log(container);
                return false;
            });
        }

        /**
         * 将其他的容器之中的数据给删除
        */
        // public deleteData(idValue: string ) {


        // }

        private registerItemDragEvent(a: HTMLAnchorElement): void {
            a.setAttribute('draggable', 'true');

            Linq.DOM.addEvent(a, 'dragstart', function (e) {
                var event = <DragEvent>e;
                var data: string = JSON.stringify({
                    key: a.id,
                    value: a.innerText
                });

                // only dropEffect='copy' will be dropable
                event.dataTransfer.effectAllowed = 'copy';
                // required otherwise doesn't work
                event.dataTransfer.setData('Text', data);
            });
        }


        /**
         * 为数据对象在容器之中注册鼠标事件
        */
        private registerDatas(items: Map<string, string>[], srcContainer: string) {
            var data = Container.createDocument(items);
            var container = document.getElementById(srcContainer);

            data.ForEach(a => {
                container.appendChild(a.key);
            })
            data.Select(a => a.value)
                .ForEach(el => {
                    this.registerItemDragEvent(el);
                });
        }

        /**
         * 测试部分开始
         */

        /**
         * 原始数据分组移动时，在新的分组中添加数据显示
        */

        private static createNewItem(item: Map<string, string>): Map<HTMLLIElement, HTMLAnchorElement> {
            var li = document.createElement("li");
            var a = document.createElement("a");
            var i_tag = document.createElement("i");
            
            a.id = item.key;
            a.href = "#";
            a.innerText = item.value;
            var a_style = a.style;
            a_style.cssFloat = "left";
            li.appendChild(a);

            i_tag.className  = "fa fa-times";
            i_tag.onclick = function() { 
                i_tag.parentNode.removeChild(i_tag);

            };
            var style = i_tag.style;
            style.lineHeight  = "line-height: 52px";
            style.color       = "red";
            style.fontSize    = "20px";
            style.cursor      = "pointer";
            style.cssFloat    = "right";
            style.marginRight = "10px";
            style.marginTop   = "20px";
            li.appendChild(i_tag);

            return <Map<HTMLLIElement, HTMLAnchorElement>>{
                key: li, value: a
            };
        }
        

        /**
         * 测试结束
         */



        private static createItem(item: Map<string, string>): Map<HTMLLIElement, HTMLAnchorElement> {
            var li = document.createElement("li");
            var a = document.createElement("a");
            
            a.id = item.key;
            a.href = "#";
            a.innerText = item.value;
            li.appendChild(a);

            return <Map<HTMLLIElement, HTMLAnchorElement>>{
                key: li, value: a
            };
        }

        private static createDocument(items: Map<string, string>[]): IEnumerator<Map<HTMLLIElement, HTMLAnchorElement>> {
            return From(items).Select(Container.createItem);
        }
    }
}