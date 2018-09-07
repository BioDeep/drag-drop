/// <reference path="../../build/linq.d.ts" />
var BioDeep;
(function (BioDeep) {
    var UI;
    (function (UI) {
        var Container = /** @class */ (function () {
            /**
             * @param items 所需要进行拖拽的数据列表 是一个键值对，其中键名是资源的唯一标记，而键值则是用户界面显示使用的
             * @param containers 所接纳的容器对象的id编号列表
            */
            function Container(items, srcContainer, containers) {
                var union = containers.slice();
                union.push(srcContainer);
                this.containers = new Dictionary(TypeInfo.EmptyObject(union, function () { return []; }));
                this.registerDatas(items, srcContainer);
                this.registerContainers(containers);
                this.registerContainers([srcContainer]);
                UI.stylingContainers(containers);
                UI.stylingItems(From(items).Select(function (id) { return id.key; }));
                UI.stylingContainers([srcContainer]);
            }
            Object.defineProperty(Container.prototype, "Data", {
                /**
                 * 从这个属性获取得到拖拽的结果数据
                */
                get: function () {
                    var x = {};
                    var table = this.containers;
                    this.containers
                        .Keys
                        .ForEach(function (key) {
                        x[key] = table.Item(key);
                    });
                    return x;
                },
                enumerable: true,
                configurable: true
            });
            Container.prototype.registerContainers = function (names) {
                var _this = this;
                From(names)
                    .Select(function (id) { return document.querySelector("#" + id); })
                    .ForEach(function (container) {
                    var ul = document.createElement("ul");
                    ul.id = container.id + "-ul";
                    container.appendChild(ul);
                    _this.binEach(container, _this.containers);
                });
            };
            /**
             * 为某一个指定的容器对象注册鼠标事件
            */
            Container.prototype.binEach = function (bin, container) {
                var key = bin.id;
                var dev = this;
                Linq.DOM.addEvent(bin, 'dragover', function (e) {
                    if (e.preventDefault) {
                        // allows us to drop
                        e.preventDefault();
                    }
                    this.className = 'over';
                    e.dataTransfer.dropEffect = 'copy';
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
                    var event = e;
                    var strval = event.dataTransfer.getData('Text');
                    // console.log(strval);
                    var data = JSON.parse(strval);
                    var keyId = data.key;
                    var el = document.getElementById(keyId);
                    // var newItem = Container.createNewItem(data);
                    var newItem = Container.createItem(data);
                    el.parentNode.parentNode.removeChild(el.parentNode);
                    // stupid nom text + fade effect
                    bin.className = '';
                    document.getElementById(bin.id + "-ul").appendChild(newItem.key);
                    UI.applyItemStyle(keyId);
                    dev.registerItemDragEvent(newItem.value);
                    container.Keys.ForEach(function (key) {
                        if (container.Item(key).indexOf(data.key) > -1) {
                            var list = From(container.Item(key))
                                .Where(function (id) { return id != data.key; })
                                .ToArray();
                            container.Delete(key).Add(key, list);
                        }
                    });
                    // 在这里得到data数据之后，将数据添加进入对应的容器之中
                    container.Item(key).push(data.key);
                    localStorage.setItem("groupset", JSON.stringify(dev.Data));
                    // console.log(container);
                    return false;
                });
            };
            /**
             * 将其他的容器之中的数据给删除
            */
            // public deleteData(idValue: string ) {
            // }
            Container.prototype.registerItemDragEvent = function (a) {
                a.setAttribute('draggable', 'true');
                Linq.DOM.addEvent(a, 'dragstart', function (e) {
                    var event = e;
                    var data = JSON.stringify({
                        key: a.id,
                        value: a.innerText
                    });
                    // only dropEffect='copy' will be dropable
                    event.dataTransfer.effectAllowed = 'copy';
                    // required otherwise doesn't work
                    event.dataTransfer.setData('Text', data);
                });
            };
            /**
             * 为数据对象在容器之中注册鼠标事件
            */
            Container.prototype.registerDatas = function (items, srcContainer) {
                var _this = this;
                var data = Container.createDocument(items);
                var container = document.getElementById(srcContainer);
                data.ForEach(function (a) {
                    container.appendChild(a.key);
                });
                data.Select(function (a) { return a.value; })
                    .ForEach(function (el) {
                    _this.registerItemDragEvent(el);
                });
            };
            /**
             * 测试部分开始
             */
            /**
             * 原始数据分组移动时，在新的分组中添加数据显示
            */
            Container.createNewItem = function (item) {
                var li = document.createElement("li");
                var a = document.createElement("a");
                var i_tag = document.createElement("i");
                a.id = item.key;
                a.href = "#";
                a.innerText = item.value;
                var a_style = a.style;
                a_style.cssFloat = "left";
                li.appendChild(a);
                i_tag.className = "fa fa-times";
                i_tag.onclick = function () {
                    i_tag.parentNode.removeChild(i_tag);
                };
                var style = i_tag.style;
                style.lineHeight = "line-height: 52px";
                style.color = "red";
                style.fontSize = "20px";
                style.cursor = "pointer";
                style.cssFloat = "right";
                style.marginRight = "10px";
                style.marginTop = "20px";
                li.appendChild(i_tag);
                return {
                    key: li, value: a
                };
            };
            /**
             * 测试结束
             */
            Container.createItem = function (item) {
                var li = document.createElement("li");
                var a = document.createElement("a");
                a.id = item.key;
                a.href = "#";
                a.innerText = item.value;
                li.appendChild(a);
                return {
                    key: li, value: a
                };
            };
            Container.createDocument = function (items) {
                return From(items).Select(Container.createItem);
            };
            return Container;
        }());
        UI.Container = Container;
    })(UI = BioDeep.UI || (BioDeep.UI = {}));
})(BioDeep || (BioDeep = {}));
var BioDeep;
(function (BioDeep) {
    var UI;
    (function (UI) {
        function stylingContainers(names) {
            names.forEach(function (id) {
                var div = document.getElementById(id);
                var style = div.style;
                style.height = "450px";
                style.width = "100%";
                style.cssFloat = "left";
                style.backgroundColor = "#d9edf7";
                style.borderRadius = "5px";
                style.position = "relative";
                style.marginTop = "0";
            });
        }
        UI.stylingContainers = stylingContainers;
        function stylingItems(keys) {
            if (typeof keys == "string") {
                applyItemStyle(keys);
            }
            else if (Array.isArray(keys)) {
                keys.forEach(applyItemStyle);
            }
            else {
                keys.ForEach(applyItemStyle);
            }
        }
        UI.stylingItems = stylingItems;
        function applyItemStyle(id) {
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
        UI.applyItemStyle = applyItemStyle;
    })(UI = BioDeep.UI || (BioDeep.UI = {}));
})(BioDeep || (BioDeep = {}));
//# sourceMappingURL=drag_and_drop.js.map