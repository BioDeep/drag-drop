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

            this.registerDatas(items, srcContainer);
            this.registerContainers(containers);

            stylingContainers(containers);
            stylingItems(From(items).Select(id => id.key));
        }

        private registerContainers(names: string[]) {
            var obj = {};

            names.forEach(id => {
                obj[id] = [];
            })

            this.containers = new Dictionary<string[]>(obj);
            console.log(this.containers);
            From(names)
                .Select(id => document.querySelector(`#${id}`))
                .ForEach(this.binEach);
        }

        private binEach(bin: HTMLElement) {
            var key: string = bin.id;
            var container = this.containers;

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
                var data: string = event.dataTransfer.getData('Text')
                var el = document.getElementById(data);

                el.parentNode.removeChild(el);
                // stupid nom text + fade effect
                bin.className = '';

                // 在这里得到data数据之后，将数据添加进入对应的容器之中
                console.log(container);
                container.Item(key).push(data);

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
                        // only dropEffect='copy' will be dropable
                        event.dataTransfer.effectAllowed = 'copy';
                        // required otherwise doesn't work
                        event.dataTransfer.setData('Text', el.id);
                    });
                });
        }

        private static createDocument(items: Map<string, string>[]): IEnumerator<Map<HTMLLIElement, HTMLAnchorElement>> {
            return From(items)
                .Select(name => {
                    var li = document.createElement("li");
                    var a = document.createElement("a");

                    a.id = name.key;
                    a.href = "#";
                    a.innerText = name.value;
                    li.appendChild(a);

                    return <Map<HTMLLIElement, HTMLAnchorElement>>{
                        key: li, value: a
                    };
                });
        }
    }
}