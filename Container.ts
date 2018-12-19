/// <reference path="../../build/linq.d.ts" />

namespace BioDeep.UI {

    export class Container {

        private containers: Dictionary<string[]>;
        private storeKey: string;

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
            containers: string[],
            storeKey: string = "group_set") {

            var union: IEnumerator<string> = From(containers)
                .ToList()
                .Add(srcContainer);
            var groupset: string = localStorage.getItem(storeKey);

            if (!isNullOrUndefined(groupset)) {
                this.containers = new Dictionary<string[]>(JSON.parse(groupset));
            } else {
                this.containers = new Dictionary<string[]>(TypeInfo.EmptyObject(union, () => (<string[]>[])));
                // 在初始化的时候src应该是有所有的数据的
                this.containers.Delete(srcContainer).Add(
                    srcContainer,
                    From(items).Select(map => map.key).ToArray()
                );
            }

            var srcItems = this.containers.Item(srcContainer);
            var filter = From(items)
                .Where(key => srcItems.indexOf(key.key) > -1)
                .ToArray();

            this.registerDatas(filter, srcContainer);
            this.registerContainers(union.ToArray());

            stylingContainers(containers);
            stylingItems(From(filter).Select(id => id.key));
            stylingContainers([srcContainer]);

            this.storeKey = storeKey;
            this.init(items, srcContainer);
        }

        /**
         * @param items 使用这个参数主要是为了得到在用户界面上的显示title
         * @param src 因为数据源已经在前面的registerDatas函数中初始化过了，所以在这个初始化函数中会跳过
        */
        private init(items: Map<string, string>[], src: string) {
            var data = this.containers;
            var maps = new Dictionary<string>(items);
            var dev: Container = this;

            this.containers
                .Keys
                .Where(id => id != src)
                .ForEach(containerId => {
                    var keys: string[] = data.Item(containerId);

                    keys.forEach(keyId => {
                        var value = new Map<string, string>(keyId, maps.Item(keyId));
                        var newItem = Container.createItem(value);
                        var ul: string = `#${containerId}-ul`;

                        (<HTMLElement>$ts(ul)).appendChild(newItem.key);
                        applyItemStyle(keyId);
                        dev.registerItemDragEvent(newItem.value);
                    });
                });
        }

        private registerContainers(names: string[]) {
            From(names)
                .Select(id => <HTMLElement>document.querySelector(`#${id}`))
                .ForEach(container => {
                    container.appendChild($ts("<ul>", {
                        id: `${container.id}-ul`
                    }));
                    this.binEach(container, this.containers)
                });
        }

        /**
         * 为某一个指定的容器对象注册鼠标事件
        */
        private binEach(bin: HTMLElement, container: Dictionary<string[]>) {
            var dev = this;

            DOM.addEvent(bin, 'dragover', function (e) {
                if (e.preventDefault) {
                    // allows us to drop
                    e.preventDefault();
                }
                this.className = 'over';

                (<DragEvent>e).dataTransfer.dropEffect = 'copy';

                return false;
            });

            // to get IE to work
            DOM.addEvent(bin, 'dragenter', function (e) {
                this.className = 'over';
                return false;
            });

            DOM.addEvent(bin, 'dragleave', function () {
                this.className = '';
            });

            DOM.addEvent(bin, 'drop', function (e) {
                if (e.stopPropagation) {
                    // stops the browser from redirecting...why???
                    e.stopPropagation();
                }

                dev.dropData(<DragEvent>e, bin, container);

                return false;
            });
        }

        private dropData(event: DragEvent, bin: HTMLElement, container: Dictionary<string[]>) {
            var strval: string = event.dataTransfer.getData('Text');
            var data: Map<string, string>;

            try {
                data = JSON.parse(strval);
            } catch (ex) {
                console.error("JSON parser error: " + strval);
                return false;
            }

            var keyId: string = data.key;
            var el = document.getElementById(keyId);
            var newItem = Container.createItem(data);
            var key: string = bin.id;
            var ul: string = `${bin.id}-ul`;

            el.parentNode.parentNode.removeChild(el.parentNode);
            // stupid nom text + fade effect
            bin.className = '';
            document.getElementById(ul).appendChild(newItem.key);
            applyItemStyle(keyId);

            this.registerItemDragEvent(newItem.value);

            container.Keys.ForEach(key => {
                if (container.Item(key).indexOf(data.key) > -1) {
                    var list = From(container.Item(key))
                        .Where(id => id != data.key)
                        .ToArray();

                    container.Delete(key).Add(key, list);
                }
            });

            // 在这里得到data数据之后，将数据添加进入对应的容器之中
            container.Item(key).push(data.key);
            localStorage.setItem(this.storeKey, JSON.stringify(this.Data));
        }

        private registerItemDragEvent(a: HTMLAnchorElement): void {
            a.setAttribute('draggable', 'true');

            DOM.addEvent(a, 'dragstart', function (e) {
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
         * @param item 资源的键值对数据，key为数据库之中的唯一编号，value则是这个资源的用户界面上的显示标题
        */
        private static createItem(item: Map<string, string>): Map<HTMLLIElement, HTMLAnchorElement> {
            var li = document.createElement("li");
            var a: HTMLTsElement = (<HTMLTsElement>$ts("<a>", {
                id: item.key,
                href: "#"
            }).asExtends).text(item.value);

            li.appendChild(a.HTMLElement);

            return <Map<HTMLLIElement, HTMLAnchorElement>>{
                key: li,
                value: a.HTMLElement
            };
        }

        private static createDocument(items: Map<string, string>[]): IEnumerator<Map<HTMLLIElement, HTMLAnchorElement>> {
            return From(items).Select(Container.createItem);
        }
    }
}