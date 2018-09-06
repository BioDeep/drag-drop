/// <reference path="../../build/linq.d.ts" />

namespace BioDeep.UI {

    export class Container {

        private containers: Dictionary<string[]>;

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

            this.containers = new Dictionary<string[]>(TypeInfo.EmptyObject(containers, () => (<string[]>[])));
            this.registerDatas(items, srcContainer);
            this.registerContainers(containers);

            stylingContainers(containers);
            stylingItems(From(items).Select(id => id.key));
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

        private binEach(bin: HTMLElement, container: Dictionary<string[]>) {
            var key: string = bin.id;

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

                console.log(strval);

                var data = <Map<string, string>>JSON.parse(strval);
                var keyId: string = data.key;
                var el = document.getElementById(keyId);

                el.parentNode.removeChild(el);
                // stupid nom text + fade effect
                bin.className = '';
                document.getElementById(`${bin.id}-ul`).appendChild(Container.createItem(data).key);
                applyItemStyle(keyId);

                // 在这里得到data数据之后，将数据添加进入对应的容器之中
                // console.log(container);
                container.Item(key).push(data.key);

                return false;
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
                    el.setAttribute('draggable', 'true');

                    Linq.DOM.addEvent(el, 'dragstart', function (e) {
                        var event = <DragEvent>e;
                        var data: string = JSON.stringify({
                            key: el.id,
                            value: el.innerText
                        });

                        // only dropEffect='copy' will be dropable
                        event.dataTransfer.effectAllowed = 'copy';
                        // required otherwise doesn't work
                        event.dataTransfer.setData('Text', data);
                    });
                });
        }

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